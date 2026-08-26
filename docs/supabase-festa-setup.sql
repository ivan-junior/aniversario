-- =============================================================================
-- Concurso de Fantasias — setup completo (Supabase)
-- Execute este arquivo inteiro no SQL Editor do projeto Supabase.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.costumes (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null unique,
  name text not null,
  costume text not null,
  created_at timestamptz not null default now(),
  constraint costumes_name_length
    check (char_length(trim(name)) between 2 and 60),
  constraint costumes_costume_length
    check (char_length(trim(costume)) between 2 and 80)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null unique,
  costume_id uuid not null references public.costumes (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists votes_costume_id_idx on public.votes (costume_id);

create table if not exists public.party_config (
  id integer primary key,
  costume_registration_open boolean not null default true,
  voting_open boolean not null default false,
  voting_ended boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint party_config_singleton check (id = 1)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.party_config (
  id,
  costume_registration_open,
  voting_open,
  voting_ended
)
values (1, true, false, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Helper: is_admin
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: register_costume
-- ---------------------------------------------------------------------------

create or replace function public.register_costume(
  p_device_id uuid,
  p_name text,
  p_costume text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open boolean;
  v_name text;
  v_costume text;
  v_existing public.costumes%rowtype;
  v_row public.costumes%rowtype;
begin
  if p_device_id is null then
    raise exception 'invalid_device'
      using errcode = 'P0001';
  end if;

  select costume_registration_open
  into v_open
  from public.party_config
  where id = 1;

  if coalesce(v_open, false) is not true then
    raise exception 'registration_closed'
      using errcode = 'P0001';
  end if;

  v_name := trim(coalesce(p_name, ''));
  v_costume := trim(coalesce(p_costume, ''));

  if char_length(v_name) < 2 or char_length(v_name) > 60 then
    raise exception 'invalid_name'
      using errcode = 'P0001';
  end if;

  if char_length(v_costume) < 2 or char_length(v_costume) > 80 then
    raise exception 'invalid_costume'
      using errcode = 'P0001';
  end if;

  select *
  into v_existing
  from public.costumes
  where device_id = p_device_id;

  if found then
    return jsonb_build_object(
      'costume', jsonb_build_object(
        'id', v_existing.id,
        'name', v_existing.name,
        'costume', v_existing.costume,
        'isMine', true
      ),
      'alreadyRegistered', true
    );
  end if;

  begin
    insert into public.costumes (device_id, name, costume)
    values (p_device_id, v_name, v_costume)
    returning * into v_row;
  exception
    when unique_violation then
      select *
      into v_existing
      from public.costumes
      where device_id = p_device_id;

      return jsonb_build_object(
        'costume', jsonb_build_object(
          'id', v_existing.id,
          'name', v_existing.name,
          'costume', v_existing.costume,
          'isMine', true
        ),
        'alreadyRegistered', true
      );
  end;

  return jsonb_build_object(
    'costume', jsonb_build_object(
      'id', v_row.id,
      'name', v_row.name,
      'costume', v_row.costume,
      'isMine', true
    ),
    'alreadyRegistered', false
  );
end;
$$;

revoke all on function public.register_costume(uuid, text, text) from public;
grant execute on function public.register_costume(uuid, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: cast_vote
-- ---------------------------------------------------------------------------

create or replace function public.cast_vote(
  p_device_id uuid,
  p_costume_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_voting_open boolean;
  v_voting_ended boolean;
  v_target public.costumes%rowtype;
begin
  if p_device_id is null then
    raise exception 'invalid_device'
      using errcode = 'P0001';
  end if;

  if p_costume_id is null then
    raise exception 'invalid_costume_id'
      using errcode = 'P0001';
  end if;

  select voting_open, voting_ended
  into v_voting_open, v_voting_ended
  from public.party_config
  where id = 1;

  if coalesce(v_voting_open, false) is not true then
    if coalesce(v_voting_ended, false) then
      raise exception 'voting_ended'
        using errcode = 'P0001';
    end if;
    raise exception 'voting_closed'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.votes
    where device_id = p_device_id
  ) then
    raise exception 'already_voted'
      using errcode = 'P0001';
  end if;

  select *
  into v_target
  from public.costumes
  where id = p_costume_id;

  if not found then
    raise exception 'costume_not_found'
      using errcode = 'P0001';
  end if;

  if v_target.device_id = p_device_id then
    raise exception 'self_vote'
      using errcode = 'P0001';
  end if;

  begin
    insert into public.votes (device_id, costume_id)
    values (p_device_id, p_costume_id);
  exception
    when unique_violation then
      raise exception 'already_voted'
        using errcode = 'P0001';
  end;

  return jsonb_build_object('voted', true);
end;
$$;

revoke all on function public.cast_vote(uuid, uuid) from public;
grant execute on function public.cast_vote(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: list_costumes
-- ---------------------------------------------------------------------------

create or replace function public.list_costumes(
  p_device_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status record;
  v_my_costume_id uuid;
  v_has_voted boolean;
  v_costumes jsonb;
begin
  select
    costume_registration_open,
    voting_open,
    voting_ended
  into v_status
  from public.party_config
  where id = 1;

  select c.id
  into v_my_costume_id
  from public.costumes c
  where p_device_id is not null
    and c.device_id = p_device_id;

  v_has_voted := exists (
    select 1
    from public.votes v
    where p_device_id is not null
      and v.device_id = p_device_id
  );

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'costume', c.costume,
        'isMine', (p_device_id is not null and c.device_id = p_device_id)
      )
      order by c.created_at asc
    ),
    '[]'::jsonb
  )
  into v_costumes
  from public.costumes c;

  return jsonb_build_object(
    'costumes', v_costumes,
    'myCostumeId', v_my_costume_id,
    'hasVoted', v_has_voted,
    'votingOpen', coalesce(v_status.voting_open, false),
    'votingEnded', coalesce(v_status.voting_ended, false),
    'registrationOpen', coalesce(v_status.costume_registration_open, false)
  );
end;
$$;

revoke all on function public.list_costumes(uuid) from public;
grant execute on function public.list_costumes(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: get_costume_ranking
-- ---------------------------------------------------------------------------

create or replace function public.get_costume_ranking()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status record;
  v_ranking jsonb;
  v_total_votes integer;
  v_total_costumes integer;
begin
  if not public.is_admin() then
    raise exception 'not_admin'
      using errcode = 'P0001';
  end if;

  select
    costume_registration_open,
    voting_open,
    voting_ended
  into v_status
  from public.party_config
  where id = 1;

  select count(*)::integer
  into v_total_votes
  from public.votes;

  select count(*)::integer
  into v_total_costumes
  from public.costumes;

  with tallied as (
    select
      c.id,
      c.name,
      c.costume,
      count(v.id)::integer as vote_count
    from public.costumes c
    left join public.votes v on v.costume_id = c.id
    group by c.id, c.name, c.costume
  ),
  ordered as (
    select
      row_number() over (
        order by t.vote_count desc, t.costume asc
      )::integer as position,
      t.id,
      t.name,
      t.costume,
      t.vote_count
    from tallied t
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'position', o.position,
        'id', o.id,
        'name', o.name,
        'costume', o.costume,
        'votes', o.vote_count
      )
      order by o.position
    ),
    '[]'::jsonb
  )
  into v_ranking
  from ordered o;

  return jsonb_build_object(
    'ranking', v_ranking,
    'totalVotes', v_total_votes,
    'totalCostumes', v_total_costumes,
    'status', jsonb_build_object(
      'registrationOpen', coalesce(v_status.costume_registration_open, false),
      'votingOpen', coalesce(v_status.voting_open, false),
      'votingEnded', coalesce(v_status.voting_ended, false)
    )
  );
end;
$$;

revoke all on function public.get_costume_ranking() from public;
grant execute on function public.get_costume_ranking() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.costumes enable row level security;
alter table public.votes enable row level security;
alter table public.party_config enable row level security;
alter table public.admin_users enable row level security;

-- party_config: leitura pública; update só admin
drop policy if exists party_config_select_public on public.party_config;
create policy party_config_select_public
  on public.party_config
  for select
  to anon, authenticated
  using (true);

drop policy if exists party_config_update_admin on public.party_config;
create policy party_config_update_admin
  on public.party_config
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- costumes: SELECT só admin (convidados usam list_costumes RPC)
drop policy if exists costumes_select_admin on public.costumes;
create policy costumes_select_admin
  on public.costumes
  for select
  to authenticated
  using (public.is_admin());

-- votes: SELECT só admin (sem insert/update/delete direto)
drop policy if exists votes_select_admin on public.votes;
create policy votes_select_admin
  on public.votes
  for select
  to authenticated
  using (public.is_admin());

-- admin_users: sem policies públicas (só via is_admin SECURITY DEFINER)

-- ---------------------------------------------------------------------------
-- Grants de tabela (mínimos)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.party_config to anon, authenticated;
grant update on public.party_config to authenticated;

grant select on public.costumes to authenticated;
grant select on public.votes to authenticated;

-- Sem grant de insert/update/delete em costumes/votes para roles de cliente.
-- Sem grant em admin_users.

-- ---------------------------------------------------------------------------
-- RPC: admin_clear_party_data
-- Apaga votes + costumes; preserva party_config e admin_users.
-- ---------------------------------------------------------------------------

create or replace function public.admin_clear_party_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin'
      using errcode = 'P0001';
  end if;

  -- WHERE true: necessário com a extensão safeupdate (Supabase)
  delete from public.votes where true;
  delete from public.costumes where true;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.admin_clear_party_data() from public;
grant execute on function public.admin_clear_party_data() to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin_delete_costume
-- Remove uma fantasia; votos recebidos saem via ON DELETE CASCADE.
-- Não remove votos que o device_id do participante fez em outras fantasias.
-- ---------------------------------------------------------------------------

create or replace function public.admin_delete_costume(p_costume_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_votes integer;
begin
  if not public.is_admin() then
    raise exception 'not_admin'
      using errcode = 'P0001';
  end if;

  if p_costume_id is null then
    raise exception 'invalid_costume_id'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.costumes where id = p_costume_id
  ) then
    raise exception 'costume_not_found'
      using errcode = 'P0001';
  end if;

  select count(*)::integer
  into v_deleted_votes
  from public.votes
  where costume_id = p_costume_id;

  delete from public.costumes
  where id = p_costume_id;

  return jsonb_build_object(
    'success', true,
    'deletedVotes', v_deleted_votes
  );
end;
$$;

revoke all on function public.admin_delete_costume(uuid) from public;
grant execute on function public.admin_delete_costume(uuid) to authenticated;

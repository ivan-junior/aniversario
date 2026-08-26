# Concurso de Fantasias — configuração no Supabase

Backend do cadastro de fantasias e votação, separado do RSVP.

SQL completo: [`docs/supabase-festa-setup.sql`](./supabase-festa-setup.sql)

Arquitetura:

```text
Convidado → aniversario.ivanjunior.dev (Vite/Vercel)
         → @supabase/supabase-js
         → Supabase (PostgreSQL + Auth + RLS + RPCs)
```

Não é necessário criar NestJS, Express, Vercel Functions ou outro backend.

---

## 1. Criar conta e projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login (GitHub ou e-mail).
2. Clique em **New project**.
3. Escolha (ou crie) uma **Organization**.
4. Preencha:
   - **Name:** algo como `aniversario-festa`
   - **Database Password:** senha forte do banco (guarde em local seguro; não vai no frontend)
   - **Region:** a mais próxima (ex.: `South America (Sao Paulo)` se disponível)
5. Clique em **Create new project** e aguarde a criação (1–2 minutos).

Não é necessário configurar infraestrutura avançada.

---

## 2. Executar o SQL do projeto

1. No menu lateral do projeto: **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo [`docs/supabase-festa-setup.sql`](./supabase-festa-setup.sql) neste repositório.
4. Copie **todo** o conteúdo e cole no editor.
5. Clique em **Run** (ou Ctrl/Cmd + Enter).

Se tudo der certo, você verá uma confirmação de sucesso sem erros vermelhos.

Esse SQL cria:

- tabelas `costumes`, `votes`, `party_config`, `admin_users`
- função `is_admin()`
- RPCs `register_costume`, `cast_vote`, `list_costumes`, `get_costume_ranking`
- Row Level Security (RLS) e policies

---

## 3. Verificar as tabelas

1. No menu lateral: **Table Editor**.
2. Confira se existem:

| Tabela | Esperado |
|--------|----------|
| `costumes` | vazia no início |
| `votes` | vazia no início |
| `party_config` | **1 linha** com `id = 1`, cadastro aberto, votação fechada |
| `admin_users` | vazia até você inserir o admin |

---

## 4. Obter URL e anon key

1. No menu lateral: **Project Settings** (engrenagem).
2. Abra **API** (ou **API Keys**, conforme a versão do dashboard).
3. Copie:

| Campo no dashboard | Variável no `.env` |
|--------------------|--------------------|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon** / **public** key | `VITE_SUPABASE_ANON_KEY` |

No arquivo `.env` local:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Sobre a anon key

A chave `anon` **aparece no navegador**. Isso é esperado.

A segurança **não** depende de esconder essa chave. Ela depende de:

- RLS (Row Level Security)
- Policies
- RPCs (`SECURITY DEFINER`)
- Constraints no PostgreSQL
- Supabase Auth + tabela `admin_users`

**Nunca** coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend ou em variáveis `VITE_*`.

---

## 5. Configurar na Vercel

1. Abra o projeto em [vercel.com](https://vercel.com).
2. **Settings → Environment Variables**.
3. Adicione (Production / Preview / Development, conforme desejar):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon/public key |

Mantenha também (se já existirem):

- `VITE_GOOGLE_SCRIPT_URL` — RSVP (Apps Script separado)
- `VITE_SITE_URL` — Open Graph

4. Remova, se ainda existirem no projeto:

- `VITE_APPS_SCRIPT_URL`
- `VITE_ADMIN_PASSWORD`

5. Faça um **novo deploy** (Redeploy) para o build pegar as novas variáveis `VITE_*`.

---

## 6. Criar o usuário administrador

O `/admin` usa **Supabase Auth** (e-mail + senha). Não há botão "Criar conta" no site.

### 6.1 Criar o usuário no dashboard

1. Menu lateral: **Authentication**.
2. Aba **Users**.
3. **Add user** (ou **Create user**).
4. Escolha **Create new user**.
5. Informe:
   - **Email** (ex.: o seu e-mail pessoal)
   - **Password** (senha forte)
6. Marque **Auto Confirm User** se a opção existir (evita precisar confirmar e-mail).
7. Crie o usuário.

### 6.2 Copiar o UUID

Na lista de usuários, abra o usuário criado e copie o **User UID** (UUID).

### 6.3 Inserir na whitelist `admin_users`

1. Volte ao **SQL Editor**.
2. Execute (substitua o UUID):

```sql
insert into public.admin_users (user_id)
values ('COLE_O_UUID_AQUI');
```

Somente usuários presentes em `admin_users` têm acesso administrativo.
Autenticar com um e-mail qualquer **não** basta.

---

## 7. Login no `/admin`

1. Abra:

```text
https://aniversario.ivanjunior.dev/admin
```

(ou `http://localhost:5173/admin` em desenvolvimento)

2. Entre com o **e-mail** e a **senha** criados no Authentication.
3. Você verá o painel com:
   - Abrir / fechar cadastro
   - Abrir / fechar votação
   - Ranking (atualiza a cada ~10s), com remoção individual de participante
   - Zona de manutenção (limpar fantasias e votos)
   - Botão **Sair**

---

## 8. Resetando dados de teste

### Pelo painel `/admin` (recomendado)

> Se o projeto Supabase já existia antes desta feature, execute no **SQL Editor** o bloco das RPCs `admin_clear_party_data` e `admin_delete_costume` no final de [`docs/supabase-festa-setup.sql`](./supabase-festa-setup.sql) (`create or replace` + grants).

Na **Zona de manutenção**, use **Limpar fantasias e votos**.

- Confirmação exige digitar `LIMPAR`.
- Remove todas as fantasias e todos os votos.
- **Não** altera `party_config` (cadastro/votação continuam como estavam).
- **Não** apaga `admin_users` nem usuários do Auth.
- Equivale à RPC `admin_clear_party_data`.

Para remover **um** participante do ranking, use o ícone de lixeira na linha. Isso chama `admin_delete_costume` e apaga a fantasia + os votos **recebidos** por ela (via `ON DELETE CASCADE` em `votes.costume_id`). Votos que aquele `device_id` tenha feito em outras fantasias **permanecem**.

### Pelo SQL Editor (manual)

Para limpar fantasias e votos sem apagar config/admin:

```sql
-- WHERE true: necessário com a extensão safeupdate (Supabase)
delete from public.votes where true;
delete from public.costumes where true;
```

Ou, se as RPCs admin já estiverem aplicadas e você estiver autenticado como admin no client:

```sql
-- preferível via app; no SQL Editor use os DELETEs acima
select public.admin_clear_party_data();
```

Para reabrir cadastro e fechar votação (estado inicial típico) — **passo separado**, não faz parte da limpeza:

```sql
update public.party_config
set
  costume_registration_open = true,
  voting_open = false,
  voting_ended = false,
  updated_at = now()
where id = 1;
```

**Não** apague `party_config` nem `admin_users` a menos que você saiba o que está fazendo.

**CASCADE:** `votes.costume_id` referencia `costumes(id) on delete cascade`. Apagar uma fantasia remove só os votos com aquele `costume_id`, nunca votos de outras fantasias.

---

## 9. Como testar o `deviceId`

O navegador guarda um UUID em:

```text
localStorage → chave `festa_device_id`
```

Isso representa **aquele navegador**, não o aparelho real (sem fingerprint, IP ou IMEI).

Para simular outro convidado:

- abrir janela anônima; ou
- usar outro navegador; ou
- no DevTools Console:

```js
localStorage.removeItem('festa_device_id')
```

Depois recarregue a página. Um novo `deviceId` será gerado.

---

## 10. Checklist de configuração e testes

```text
[ ] Projeto Supabase criado
[ ] SQL de docs/supabase-festa-setup.sql executado
[ ] Tabelas costumes, votes, party_config, admin_users visíveis
[ ] party_config com 1 linha (id = 1)
[ ] VITE_SUPABASE_URL configurada (local e Vercel)
[ ] VITE_SUPABASE_ANON_KEY configurada (local e Vercel)
[ ] Usuário admin criado em Authentication
[ ] UUID inserido em admin_users
[ ] Redeploy na Vercel após as env vars
[ ] Cadastro de fantasia funcionando em /fantasia
[ ] Mesmo navegador não cadastra duas fantasias
[ ] Em /votar, a própria fantasia aparece bloqueada
[ ] Não consigo votar em mim mesmo (UI + RPC)
[ ] Consigo votar em outra pessoa
[ ] Mesmo navegador não consegue votar de novo
[ ] Ranking aparece somente para admin autenticado
[ ] Convidado não consegue consultar votes
[ ] Abrir/fechar cadastro funciona no /admin
[ ] Abrir/fechar votação funciona no /admin
[ ] Limpar fantasias e votos no /admin zera totais e preserva party_config
[ ] Remover participante no ranking apaga só votos recebidos
[ ] Botão Sair encerra a sessão
```

---

## 11. Testes de segurança (DevTools)

Com o site aberto e um client Supabase no Console (ou via Network):

### Deve falhar (convidado, sem login admin)

```js
const { data, error } = await supabase.from('votes').select('*')
console.log({ data, error }) // data vazia / erro de RLS
```

```js
await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
```

```js
await supabase.rpc('admin_clear_party_data')
// erro: not_admin / permission denied (sem sessão admin)
```

```js
await supabase.rpc('admin_delete_costume', {
  p_costume_id: '00000000-0000-0000-0000-000000000000',
})
```

```js
await supabase
  .from('party_config')
  .update({ voting_open: true })
  .eq('id', 1)
```

### Deve funcionar (convidado)

- consultar status (`party_config` select)
- `rpc('list_costumes', { p_device_id })`
- `rpc('register_costume', …)`
- `rpc('cast_vote', …)`

### Deve funcionar (admin autenticado + em `admin_users`)

- `rpc('get_costume_ranking')`
- `rpc('admin_clear_party_data')`
- `rpc('admin_delete_costume', { p_costume_id })`
- select em `votes` / `costumes`
- update em `party_config`

### Auto-voto (deve falhar no banco)

```js
await supabase.rpc('cast_vote', {
  p_device_id: localStorage.getItem('festa_device_id'),
  p_costume_id: 'ID_DA_SUA_FANTASIA',
})
```

Mensagem esperada: auto-voto rejeitado (`self_vote` → "Você não pode votar na sua própria fantasia.").

### Voto duplicado (deve falhar)

Chame `cast_vote` duas vezes com o mesmo `device_id`. A segunda deve falhar (`already_voted`). Mesmo com duas requisições quase simultâneas, a constraint `unique(device_id)` garante no máximo **uma** linha em `votes`.

---

## 12. RPCs e policies (referência)

| RPC | Quem chama | Função |
|-----|------------|--------|
| `register_costume` | convidado | cadastra fantasia (1 por device) |
| `cast_vote` | convidado | registra voto (1 por device; sem auto-voto) |
| `list_costumes` | convidado | lista fantasias com `isMine` (sem expor device_ids alheios) |
| `get_costume_ranking` | admin | ranking secreto |
| `admin_clear_party_data` | admin | apaga todas as fantasias e votos; preserva `party_config` e `admin_users` |
| `admin_delete_costume` | admin | apaga uma fantasia e os votos recebidos (CASCADE); preserva votos feitos em outras |
| `is_admin` | autenticado | whitelist `admin_users` |

| Tabela | Convidado | Admin |
|--------|-----------|-------|
| `party_config` | SELECT | SELECT + UPDATE |
| `costumes` | via RPC | SELECT (delete só via RPC admin) |
| `votes` | via RPC (insert) | SELECT (delete só via RPC admin / CASCADE) |
| `admin_users` | sem acesso direto | via `is_admin()` |

---

## 13. RSVP (não migrado)

A confirmação de presença continua no Google Apps Script:

- Documentação: [`docs/google-apps-script.md`](./google-apps-script.md)
- Script: `scripts/Code.gs`
- Variável: `VITE_GOOGLE_SCRIPT_URL`

Não remova essa integração ao configurar o Supabase do concurso.

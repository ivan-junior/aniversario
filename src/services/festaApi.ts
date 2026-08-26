import type {
  CostumesResult,
  PartyStatus,
  RankingResult,
  RegisterCostumeResult,
} from '../types/festa'
import { getDeviceId } from '../utils/deviceId'
import { getSupabase } from '../lib/supabase'

const FRIENDLY_NETWORK_ERROR =
  'Ops! Não conseguimos registrar agora.\n\nTente novamente em alguns segundos.'

const ERROR_MESSAGES: Record<string, string> = {
  registration_closed: 'Cadastro de fantasias encerrado.',
  voting_closed: 'A votação ainda não está aberta.',
  voting_ended: 'Votação encerrada!',
  self_vote: 'Você não pode votar na sua própria fantasia.',
  already_voted: 'Você já votou!',
  costume_not_found: 'Fantasia não encontrada.',
  invalid_device: 'Identificador do aparelho ausente.',
  invalid_name: 'Informe um nome válido (2 a 60 caracteres).',
  invalid_costume: 'Informe uma fantasia válida (2 a 80 caracteres).',
  invalid_costume_id: 'Selecione uma fantasia.',
  not_admin: 'Acesso negado. Você não é administrador.',
}

const STATUS_CACHE_MS = 10_000
let statusCache: { at: number; data: PartyStatus } | null = null

function invalidateStatusCache(): void {
  statusCache = null
}

function mapPartyStatus(row: {
  costume_registration_open: boolean
  voting_open: boolean
  voting_ended: boolean
}): PartyStatus {
  return {
    registrationOpen: row.costume_registration_open === true,
    votingOpen: row.voting_open === true,
    votingEnded: row.voting_ended === true,
  }
}

function translateError(error: unknown): Error {
  if (!(error instanceof Error) && error && typeof error === 'object') {
    const maybe = error as { message?: string; code?: string }
    const raw = `${maybe.message ?? ''} ${maybe.code ?? ''}`.toLowerCase()

    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      if (raw.includes(code.toLowerCase())) {
        return new Error(message)
      }
    }

    if (
      raw.includes('duplicate key') ||
      raw.includes('votes_device_id') ||
      raw.includes('unique constraint')
    ) {
      return new Error(ERROR_MESSAGES.already_voted)
    }

    if (maybe.message && !raw.includes('failed to fetch')) {
      return new Error(maybe.message)
    }
  }

  if (error instanceof Error) {
    const raw = error.message.toLowerCase()

    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      if (raw.includes(code.toLowerCase())) {
        return new Error(message)
      }
    }

    if (
      raw.includes('duplicate key') ||
      raw.includes('votes_device_id') ||
      raw.includes('unique constraint')
    ) {
      return new Error(ERROR_MESSAGES.already_voted)
    }

    if (
      raw.includes('vite_supabase') ||
      (raw !== 'failed to fetch' &&
        !raw.includes('network') &&
        error.message !== FRIENDLY_NETWORK_ERROR)
    ) {
      return error
    }
  }

  console.error('[festaApi]', error)
  return new Error(FRIENDLY_NETWORK_ERROR)
}

function assertData<T>(data: T | null, error: unknown): T {
  if (error) throw translateError(error)
  if (data === null || data === undefined) {
    throw new Error(FRIENDLY_NETWORK_ERROR)
  }
  return data
}

export async function getPartyStatus(
  options: { force?: boolean } = {},
): Promise<PartyStatus> {
  if (
    !options.force &&
    statusCache &&
    Date.now() - statusCache.at < STATUS_CACHE_MS
  ) {
    return statusCache.data
  }

  try {
    const { data, error } = await getSupabase()
      .from('party_config')
      .select('costume_registration_open, voting_open, voting_ended')
      .eq('id', 1)
      .single()

    const row = assertData(data, error)
    const status = mapPartyStatus(row)
    statusCache = { at: Date.now(), data: status }
    return status
  } catch (error) {
    throw translateError(error)
  }
}

export async function getCostumes(): Promise<CostumesResult> {
  try {
    const { data, error } = await getSupabase().rpc('list_costumes', {
      p_device_id: getDeviceId(),
    })

    const payload = assertData(data, error) as CostumesResult
    statusCache = {
      at: Date.now(),
      data: {
        registrationOpen: payload.registrationOpen,
        votingOpen: payload.votingOpen,
        votingEnded: payload.votingEnded,
      },
    }
    return payload
  } catch (error) {
    throw translateError(error)
  }
}

export async function registerCostume(
  name: string,
  costume: string,
): Promise<RegisterCostumeResult> {
  invalidateStatusCache()
  try {
    const { data, error } = await getSupabase().rpc('register_costume', {
      p_device_id: getDeviceId(),
      p_name: name,
      p_costume: costume,
    })

    return assertData(data, error) as RegisterCostumeResult
  } catch (error) {
    throw translateError(error)
  }
}

export async function vote(fantasiaId: string): Promise<{ voted: true }> {
  try {
    const { data, error } = await getSupabase().rpc('cast_vote', {
      p_device_id: getDeviceId(),
      p_costume_id: fantasiaId,
    })

    return assertData(data, error) as { voted: true }
  } catch (error) {
    throw translateError(error)
  }
}

export async function getRanking(): Promise<RankingResult> {
  try {
    const { data, error } = await getSupabase().rpc('get_costume_ranking')
    const payload = assertData(data, error) as RankingResult
    statusCache = { at: Date.now(), data: payload.status }
    return payload
  } catch (error) {
    throw translateError(error)
  }
}

export async function setRegistrationStatus(
  open: boolean,
): Promise<PartyStatus> {
  invalidateStatusCache()
  try {
    const { data, error } = await getSupabase()
      .from('party_config')
      .update({
        costume_registration_open: open,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('costume_registration_open, voting_open, voting_ended')
      .single()

    const status = mapPartyStatus(assertData(data, error))
    statusCache = { at: Date.now(), data: status }
    return status
  } catch (error) {
    throw translateError(error)
  }
}

export async function setVotingStatus(open: boolean): Promise<PartyStatus> {
  invalidateStatusCache()
  try {
    const { data, error } = await getSupabase()
      .from('party_config')
      .update({
        voting_open: open,
        voting_ended: !open,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('costume_registration_open, voting_open, voting_ended')
      .single()

    const status = mapPartyStatus(assertData(data, error))
    statusCache = { at: Date.now(), data: status }
    return status
  } catch (error) {
    throw translateError(error)
  }
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<void> {
  try {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      throw new Error('E-mail ou senha incorretos.')
    }

    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      await adminLogout()
      throw new Error('Acesso negado. Você não é administrador.')
    }
  } catch (error) {
    throw translateError(error)
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await getSupabase().auth.signOut()
  } catch (error) {
    console.error('[festaApi] adminLogout', error)
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await getSupabase().rpc('is_admin')
    if (error) return false
    return data === true
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<{
  email: string | null
  isAdmin: boolean
} | null> {
  try {
    const {
      data: { session },
    } = await getSupabase().auth.getSession()

    if (!session) return null

    const isAdmin = await checkIsAdmin()
    return {
      email: session.user.email ?? null,
      isAdmin,
    }
  } catch {
    return null
  }
}

export type {
  Costume,
  PartyStatus,
  RankingResult,
  RegisterCostumeResult,
} from '../types/festa'

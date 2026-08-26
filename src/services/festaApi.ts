import type {
  ApiResponse,
  Costume,
  CostumesResult,
  PartyStatus,
  RankingResult,
  RegisterCostumeResult,
} from '../types/festa'
import { getDeviceId } from '../utils/deviceId'

const FRIENDLY_NETWORK_ERROR =
  'Ops! Não conseguimos registrar agora.\n\nTente novamente em alguns segundos.'

/** Cache curto de status — o Apps Script é lento; evita hits repetidos. */
const STATUS_CACHE_MS = 20_000
let statusCache: { at: number; data: PartyStatus } | null = null

function getApiUrl(): string {
  const url = import.meta.env.VITE_APPS_SCRIPT_URL

  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw new Error(
      'VITE_APPS_SCRIPT_URL não está configurada. Defina a URL no arquivo .env.',
    )
  }

  return url.trim()
}

function getAdminSecret(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD ?? ''
}

function invalidateStatusCache(): void {
  statusCache = null
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T>

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    throw new Error(FRIENDLY_NETWORK_ERROR)
  }

  if (!payload.success) {
    throw new Error(payload.error || FRIENDLY_NETWORK_ERROR)
  }

  return payload.data
}

/**
 * Apps Script Web App: POST costuma virar GET no redirect e perde o body
 * ("Ação GET inválida"). Por isso todas as ações usam GET com query params.
 */
async function requestAction<T>(
  action: string,
  params: Record<string, string | boolean | number | undefined | null> = {},
): Promise<T> {
  const url = new URL(getApiUrl())
  url.searchParams.set('action', action)

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    })

    return await parseResponse<T>(response)
  } catch (error) {
    if (error instanceof Error) {
      if (
        !error.message.includes('VITE_APPS_SCRIPT_URL') &&
        error.message !== 'Failed to fetch' &&
        error.message !== FRIENDLY_NETWORK_ERROR
      ) {
        throw error
      }
    }

    console.error('[festaApi]', error)
    throw new Error(FRIENDLY_NETWORK_ERROR)
  }
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

  const data = await requestAction<PartyStatus>('getStatus')
  statusCache = { at: Date.now(), data }
  return data
}

export async function getCostumes(): Promise<CostumesResult> {
  return requestAction<CostumesResult>('getCostumes', {
    deviceId: getDeviceId(),
  })
}

export async function registerCostume(
  name: string,
  costume: string,
): Promise<RegisterCostumeResult> {
  invalidateStatusCache()
  return requestAction<RegisterCostumeResult>('registerCostume', {
    deviceId: getDeviceId(),
    name,
    costume,
  })
}

export async function vote(fantasiaId: string): Promise<{ voted: true }> {
  return requestAction<{ voted: true }>('vote', {
    deviceId: getDeviceId(),
    fantasiaId,
  })
}

export async function getRanking(): Promise<RankingResult> {
  const data = await requestAction<RankingResult>('getRanking', {
    adminSecret: getAdminSecret(),
  })
  statusCache = { at: Date.now(), data: data.status }
  return data
}

export async function setRegistrationStatus(
  open: boolean,
): Promise<PartyStatus> {
  invalidateStatusCache()
  const data = await requestAction<PartyStatus>('setRegistrationStatus', {
    adminSecret: getAdminSecret(),
    open,
  })
  statusCache = { at: Date.now(), data }
  return data
}

export async function setVotingStatus(open: boolean): Promise<PartyStatus> {
  invalidateStatusCache()
  const data = await requestAction<PartyStatus>('setVotingStatus', {
    adminSecret: getAdminSecret(),
    open,
  })
  statusCache = { at: Date.now(), data }
  return data
}

export type { Costume, PartyStatus, RankingResult, RegisterCostumeResult }

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

async function getAction<T>(
  action: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(getApiUrl())
  url.searchParams.set('action', action)

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
    })

    return await parseResponse<T>(response)
  } catch (error) {
    if (error instanceof Error && error.message !== FRIENDLY_NETWORK_ERROR) {
      // mensagens de negócio vindas da API
      if (
        !error.message.includes('VITE_APPS_SCRIPT_URL') &&
        error.message !== 'Failed to fetch'
      ) {
        throw error
      }
    }

    console.error('[festaApi]', error)
    throw new Error(FRIENDLY_NETWORK_ERROR)
  }
}

async function postAction<T>(
  action: string,
  body: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, ...body }),
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

export async function getPartyStatus(): Promise<PartyStatus> {
  return getAction<PartyStatus>('getStatus')
}

export async function getCostumes(): Promise<CostumesResult> {
  return getAction<CostumesResult>('getCostumes', {
    deviceId: getDeviceId(),
  })
}

export async function registerCostume(
  name: string,
  costume: string,
): Promise<RegisterCostumeResult> {
  return postAction<RegisterCostumeResult>('registerCostume', {
    deviceId: getDeviceId(),
    name,
    costume,
  })
}

export async function vote(fantasiaId: string): Promise<{ voted: true }> {
  return postAction<{ voted: true }>('vote', {
    deviceId: getDeviceId(),
    fantasiaId,
  })
}

export async function getRanking(): Promise<RankingResult> {
  return postAction<RankingResult>('getRanking', {
    adminSecret: getAdminSecret(),
  })
}

export async function setRegistrationStatus(
  open: boolean,
): Promise<PartyStatus> {
  return postAction<PartyStatus>('setRegistrationStatus', {
    adminSecret: getAdminSecret(),
    open,
  })
}

export async function setVotingStatus(open: boolean): Promise<PartyStatus> {
  return postAction<PartyStatus>('setVotingStatus', {
    adminSecret: getAdminSecret(),
    open,
  })
}

export type { Costume, PartyStatus, RankingResult, RegisterCostumeResult }

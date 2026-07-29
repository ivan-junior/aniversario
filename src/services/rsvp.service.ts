import type { RsvpPayload } from '../types/rsvp'

/**
 * Envia a confirmação para o Google Apps Script.
 *
 * Usa `mode: 'no-cors'` porque Web Apps do Apps Script não enviam
 * `Access-Control-Allow-Origin`. A resposta fica "opaque" (não legível),
 * mas o POST chega ao script e a linha é gravada na planilha.
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL

  if (!url || typeof url !== 'string' || url.trim() === '') {
    const error = new Error(
      'VITE_GOOGLE_SCRIPT_URL não está configurada. Defina a URL no arquivo .env.',
    )
    console.error('[RSVP]', error.message)
    throw error
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('[RSVP] Erro na requisição:', error)
    throw error instanceof Error
      ? error
      : new Error('Erro desconhecido ao enviar confirmação')
  }
}

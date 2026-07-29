import type { RsvpPayload } from '../types/rsvp'

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
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = new Error(
        `Falha ao enviar confirmação. Status HTTP: ${response.status}`,
      )
      console.error('[RSVP]', error.message, { status: response.status })
      throw error
    }

    const text = await response.text()

    try {
      const data = JSON.parse(text) as { success?: boolean; error?: string }
      if (data.success === false) {
        const error = new Error(data.error ?? 'Resposta de erro do Apps Script')
        console.error('[RSVP]', error.message, data)
        throw error
      }
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        // Apps Script às vezes retorna HTML de redirect; se o HTTP foi OK, consideramos sucesso
        return
      }
      throw parseError
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('VITE_GOOGLE')) {
      throw error
    }
    console.error('[RSVP] Erro na requisição:', error)
    throw error instanceof Error
      ? error
      : new Error('Erro desconhecido ao enviar confirmação')
  }
}

export type RsvpPayload = {
  nome: string
  presenca: boolean
  quantidadePessoas: number
  observacoes: string
  enviadoEm: string
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

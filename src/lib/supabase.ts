import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
    throw new Error(
      'VITE_SUPABASE_URL não está configurada. Defina a variável no arquivo .env.',
    )
  }

  if (
    !supabaseAnonKey ||
    typeof supabaseAnonKey !== 'string' ||
    supabaseAnonKey.trim() === ''
  ) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY não está configurada. Defina a variável no arquivo .env.',
    )
  }

  client = createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  return client
}

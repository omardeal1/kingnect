// ─── KINGNECT — Supabase Client ────────────────────────────────────────────────
// Clientes de Supabase para browser y servidor
// El cliente de servidor usa service role key para operaciones privilegiadas (uploads)

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

/**
 * Cliente de Supabase para uso en el browser (anónimo, con RLS)
 * Solo se crea si las variables de entorno están configuradas
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Cliente de Supabase para uso en el servidor (service role, sin RLS)
 * Solo se crea si las variables de entorno están configuradas
 * ⚠️ Usar solo en rutas API o server-side — nunca en el cliente
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseServiceRoleKey)) {
    return null
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Verifica si un valor de env var es un placeholder
 */
function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower.includes("placeholder") ||
    lower.includes("your-") ||
    lower.includes("change_me") ||
    lower.includes("xxx") ||
    lower.trim() === ""
  )
}

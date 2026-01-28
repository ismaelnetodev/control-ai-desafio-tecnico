import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.searchParams.get('origin') || requestUrl.origin
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redireciona para a origem ou para o próximo destino
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Se houver erro ou não houver código, redireciona para a página de login
  // com uma mensagem de erro
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(errorUrl)
}

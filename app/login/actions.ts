'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Validação simples
  if (!email || !password) {
    redirect('/login?message=Email e senha são obrigatórios')
  }

  // 2. Tenta fazer o login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. Se der erro, redireciona com mensagem na URL
  if (error) {
    console.error('Login Error:', error.message)
    // Usamos encodeURIComponent para garantir que a URL fique válida
    const errorMessage = encodeURIComponent('Credenciais inválidas. Verifique e tente novamente.')
    redirect(`/login?message=${errorMessage}`)
  }

  // 4. Sucesso: Limpa cache e vai para o dashboard
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
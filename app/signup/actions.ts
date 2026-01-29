'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function signupAction(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const userName = formData.get('userName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validações
  if (!companyName || !userName || !email || !password) {
    redirect('/signup?error=missing_fields')
  }

  const supabase = await createClient()

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: userName },
    },
  })

  if (authError) {
    redirect('/signup?error=auth_error')
  }
  
  if (!authData.user) {
    redirect('/signup?error=user_creation_failed')
  }

  console.log("Criando empresa via Admin...")
  
  const { data: empresaData, error: empresaError } = await supabaseAdmin
    .from('empresas')
    .insert({ 
      nome: companyName,
      plano_id: null 
    })
    .select()
    .single()

  if (empresaError) {
    console.error("Erro Admin Empresa:", empresaError)
    redirect('/signup?error=company_creation_failed')
  }

  const { error: perfilError } = await supabaseAdmin
    .from('perfis')
    .update({ 
      empresa_id: empresaData.id,
      role: 'admin' 
    })
    .eq('id', authData.user.id)

  if (perfilError) {
    console.error("Erro Admin Perfil:", perfilError)
    redirect('/signup?error=profile_link_failed')
  }

  // Sucesso!
  redirect('/dashboard')
}
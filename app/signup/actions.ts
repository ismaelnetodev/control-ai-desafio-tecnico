'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js' // Importe o cliente JS padrão
import { redirect } from 'next/navigation'

export async function signupAction(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const userName = formData.get('userName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

  if (authError) return { error: authError.message }
  
  if (!authData.user) return { error: "Erro ao criar usuário" }

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
    return { error: "Erro ao criar empresa (Admin)" }
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
    return { error: "Erro ao vincular perfil" }
  }

  // Sucesso!
  redirect('/dashboard')
}
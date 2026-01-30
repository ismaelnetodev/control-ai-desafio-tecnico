'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function signupAction(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const userName = formData.get('userName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validação simples
  if (!email || !password || !companyName || !userName) {
    redirect('/signup?message=Preencha todos os campos')
  }

  const supabase = await createClient()

  // CLIENTE ADMIN (Service Role)
  // Necessário para criar a empresa e vincular o perfil ignorando RLS
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

  // 1. Tenta criar o Usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: userName }, // Metadados úteis
    },
  })

  // 2. Tratamento Específico para Usuário Já Existente
  if (authError) {
    console.error('Erro Auth:', authError.message)
    
    // Se o erro for "User already registered", mandamos para o login
    if (authError.message.includes('already registered')) {
      redirect('/login?message=Este e-mail já está cadastrado. Faça login.')
    }

    redirect(`/signup?message=${encodeURIComponent(authError.message)}`)
  }
  
  // Segurança extra: se não retornou user (caso raro de config de email confirm)
  if (!authData.user) {
    redirect('/signup?message=Verifique seu e-mail para confirmar o cadastro.')
  }

  // 3. Criar a Empresa (Usando Admin para passar por cima do RLS)
  const { data: empresaData, error: empresaError } = await supabaseAdmin
    .from('empresas')
    .insert({ 
      nome: companyName,
      plano: 'free',
      max_agentes: 1
    })
    .select()
    .single()

  if (empresaError) {
    console.error("Erro Admin Empresa:", empresaError)
    // Se falhar a empresa, idealmente deveríamos deletar o user criado, 
    // mas para MVP apenas avisamos o erro.
    redirect(`/signup?message=${encodeURIComponent('Erro ao criar empresa: ' + empresaError.message)}`)
  }

  // 4. Atualizar/Criar Perfil e Vincular (Usando Admin)
  // Tenta update primeiro (pois o trigger pode já ter criado o perfil vazio)
  const { error: perfilError } = await supabaseAdmin
    .from('perfis')
    .update({ 
      empresa_id: empresaData.id,
      role: 'admin',
      is_super_admin: false
    })
    .eq('id', authData.user.id)

  if (perfilError) {
    console.error("Erro Admin Perfil:", perfilError)
    
    // Fallback: Se update falhar (perfil não existia), faz insert
    const { error: insertError } = await supabaseAdmin
      .from('perfis')
      .insert({
        id: authData.user.id,
        empresa_id: empresaData.id,
        role: 'admin',
        is_super_admin: false
      })

    if (insertError) {
        redirect('/signup?message=Erro ao configurar perfil')
    }
  }

  // Sucesso Absoluto
  redirect('/dashboard')
}
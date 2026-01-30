'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(plano, max_agentes)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) throw new Error('Empresa não encontrada')

  const empresaData = perfil.empresas as any
  const empresa = Array.isArray(empresaData) ? empresaData[0] : empresaData
  const maxAgentes = empresa?.max_agentes || 1

  const { count, error: countError } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', perfil.empresa_id)
    .eq('ativo', true)

  if (countError) throw new Error('Erro ao verificar limites')

  if ((count || 0) >= maxAgentes) redirect('/dashboard/subscription')

  const nome = formData.get('nome') as string
  const prompt = formData.get('prompt') as string
  const modelo = formData.get('modelo') as string || 'gpt-4o-mini'
  
  if (!nome || !prompt) throw new Error('Preencha todos os campos')

  const { error } = await supabase.from('agentes_ia').insert({
    nome,
    prompt_sistema: prompt,
    empresa_id: perfil.empresa_id,
    modelo: modelo,
    ativo: true
  })

  if (error) {
    console.error(error)
    throw new Error('Erro ao criar agente')
  }

  revalidatePath('/dashboard/agents')
  redirect('/dashboard/agents')
}

export async function deleteAgent(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('agentes_ia').delete().eq('id', id)
  revalidatePath('/dashboard/agents')
}
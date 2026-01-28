'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const supabase = await createClient()

  // 1. Pega usuário e empresa
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { error: 'Empresa não encontrada' }

  // 2. Pega dados do formulário
  const nome = formData.get('nome') as string
  const prompt = formData.get('prompt') as string
  
  if (!nome || !prompt) {
    return { error: 'Preencha todos os campos obrigatórios' }
  }

  // 3. Insere no banco
  const { error } = await supabase.from('agentes_ia').insert({
    nome,
    prompt_sistema: prompt,
    empresa_id: perfil.empresa_id,
    modelo: 'gpt-4o-mini', // Padrão por enquanto
    ativo: true
  })

  if (error) {
    console.error(error)
    return { error: 'Erro ao criar agente' }
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
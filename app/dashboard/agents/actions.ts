'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const supabase = await createClient()

  // 1. Pega usuário e verifica autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Se não tiver usuário, redireciona para login
    redirect('/login')
  }

  // 2. Busca o ID da empresa e os LIMITES do plano atual
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(plano, max_agentes)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) {
    // Em Server Action puro, lançamos erro para parar a execução
    throw new Error('Empresa não encontrada')
  }

  const empresaId = perfil.empresa_id
  const dadosEmpresa = perfil.empresas as any 
  const limiteAgentes = dadosEmpresa?.max_agentes || 1

  // 3. CONTAGEM: Verifica quantos agentes a empresa JÁ tem
  const { count, error: countError } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('ativo', true)

  if (countError) {
    console.error('Erro ao verificar limites:', countError)
    throw new Error('Erro ao verificar limites do plano')
  }

  const agentesAtuais = count || 0

  // 4. BLOQUEIO: Se atingiu o limite, redireciona para Assinatura
  if (agentesAtuais >= limiteAgentes) {
    console.log(`Bloqueio: Limite de ${limiteAgentes} atingido. Redirecionando.`)
    redirect('/dashboard/subscription')
  }

  // 5. Pega dados do formulário
  const nome = formData.get('nome') as string
  const prompt = formData.get('prompt') as string
  
  if (!nome || !prompt) {
    throw new Error('Preencha todos os campos obrigatórios')
  }

  // 6. Insere no banco
  const { error } = await supabase.from('agentes_ia').insert({
    nome,
    prompt_sistema: prompt,
    empresa_id: empresaId,
    modelo: 'gpt-4o-mini',
    ativo: true
  })

  if (error) {
    console.error(error)
    throw new Error('Erro ao criar agente')
  }

  // Sucesso! Limpa o cache e redireciona
  revalidatePath('/dashboard/agents')
  redirect('/dashboard/agents')
}

export async function deleteAgent(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()

  // Aqui não precisamos validar plano, pois deletar é sempre permitido
  await supabase.from('agentes_ia').delete().eq('id', id)
  
  revalidatePath('/dashboard/agents')
}
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const supabase = await createClient()

  // 1. Pega usuário e verifica autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // 2. Busca o ID da empresa e os LIMITES do plano atual
  // O join "empresas(plano, max_agentes)" traz os dados da tabela relacionada
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(plano, max_agentes)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { error: 'Empresa não encontrada' }

  const empresaId = perfil.empresa_id
  // Tipagem forçada rápida (any) para evitar erros de TS no join se os tipos não foram gerados
  const dadosEmpresa = perfil.empresas as any 
  const limiteAgentes = dadosEmpresa?.max_agentes || 1 // Padrão é 1 se não estiver definido

  // 3. CONTAGEM: Verifica quantos agentes a empresa JÁ tem
  const { count, error: countError } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true }) // head: true traz só o número, economiza dados
    .eq('empresa_id', empresaId)

  if (countError) {
    console.error('Erro ao verificar limites:', countError)
    return { error: 'Erro ao verificar limites do plano' }
  }

  const agentesAtuais = count || 0

  // 4. BLOQUEIO: Se atingiu o limite, impede a criação
  if (agentesAtuais >= limiteAgentes) {
    console.log(`Bloqueio: Empresa tentou criar agente ${agentesAtuais + 1}, mas o limite é ${limiteAgentes}`)
    // Como não estamos usando useFormState no front ainda, isso vai apenas falhar silenciosamente na UI
    // mas garante a segurança no backend.
    return { error: `Limite do plano atingido. Seu plano permite apenas ${limiteAgentes} agentes.` }
  }

  // 5. Pega dados do formulário
  const nome = formData.get('nome') as string
  const prompt = formData.get('prompt') as string
  
  if (!nome || !prompt) {
    return { error: 'Preencha todos os campos obrigatórios' }
  }

  // 6. Insere no banco (Se passou por todas as verificações)
  const { error } = await supabase.from('agentes_ia').insert({
    nome,
    prompt_sistema: prompt,
    empresa_id: empresaId,
    modelo: 'gpt-4o-mini',
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

  // Aqui não precisamos validar plano, pois deletar é sempre permitido
  await supabase.from('agentes_ia').delete().eq('id', id)
  
  revalidatePath('/dashboard/agents')
}
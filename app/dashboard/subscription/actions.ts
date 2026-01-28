'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upgradePlan() {
  const supabase = await createClient()

  // 1. Identificar usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return

  // 2. Simular Upgrade (Muda para PRO e libera 10 agentes)
  await supabase
    .from('empresas')
    .update({ 
      plano: 'pro',
      max_agentes: 10 
    })
    .eq('id', perfil.empresa_id)

  revalidatePath('/dashboard/subscription')
  revalidatePath('/dashboard') // Atualiza home se tiver algo lá
}

export async function downgradePlan() {
    const supabase = await createClient()
  
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', user.id)
      .single()
  
    if (!perfil?.empresa_id) return
  
    // Voltar para Free
    await supabase
      .from('empresas')
      .update({ 
        plano: 'free',
        max_agentes: 1 
      })
      .eq('id', perfil.empresa_id)
  
    revalidatePath('/dashboard/subscription')
  }
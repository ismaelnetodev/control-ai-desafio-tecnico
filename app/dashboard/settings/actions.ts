'use server'

import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'

export async function saveApiKey(formData: FormData) {
  const apiKey = formData.get('apiKey') as string
  const provider = formData.get('provider') as string

  if (!apiKey || apiKey.trim() === '') {
    return { error: 'A chave da API é obrigatória' }
  }

  if (provider === 'openai') {
    if (!apiKey.startsWith('sk-')) return { error: 'A chave OpenAI deve começar com "sk-"' }
  } else if (provider === 'anthropic') {
    if (!apiKey.startsWith('sk-ant-')) return { error: 'A chave Anthropic deve começar com "sk-ant-"' }
  } else {
    return { error: 'Provedor inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado' }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { error: 'Empresa não encontrada' }

  let encryptedKey: string
  try {
    encryptedKey = encrypt(apiKey)
  } catch (error) {
    console.error('Erro crypto:', error)
    return { error: 'Erro ao criptografar a chave' }
  }

  const updateData = provider === 'openai' 
    ? { api_key_encrypted: encryptedKey } 
    : { anthropic_key_encrypted: encryptedKey }

  const { error: updateError } = await supabase
    .from('empresas')
    .update(updateData)
    .eq('id', perfil.empresa_id)

  if (updateError) {
    console.error('Erro update:', updateError)
    return { error: 'Erro ao salvar a chave no banco' }
  }

  revalidatePath('/dashboard/settings')

  return {
    success: true,
    message: `Chave ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} salva com sucesso`,
  }
}
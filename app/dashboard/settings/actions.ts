'use server'

import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'

export async function saveApiKey(formData: FormData) {
  const apiKey = formData.get('apiKey') as string

  if (!apiKey || apiKey.trim() === '') {
    return {
      error: 'A chave da API é obrigatória',
    }
  }

  // Validar se a chave começa com "sk-"
  if (!apiKey.startsWith('sk-')) {
    return {
      error: 'A chave da API deve começar com "sk-"',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'Usuário não autenticado',
    }
  }

  // Buscar perfil e empresa do usuário
  const { data: perfil, error: perfilError } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (perfilError || !perfil?.empresa_id) {
    return {
      error: 'Erro ao buscar dados da empresa',
    }
  }

  // Criptografar a chave da API
  let encryptedKey: string
  try {
    encryptedKey = encrypt(apiKey)
  } catch (error) {
    console.error('Erro ao criptografar chave:', error)
    return {
      error: 'Erro ao criptografar a chave da API',
    }
  }

  // Atualizar a tabela empresas com a chave criptografada
  const { error: updateError } = await supabase
    .from('empresas')
    .update({ api_key_encrypted: encryptedKey })
    .eq('id', perfil.empresa_id)

  if (updateError) {
    console.error('Erro ao atualizar empresa:', updateError)
    return {
      error: 'Erro ao salvar a chave da API',
    }
  }

  // Revalidar o caminho para atualizar a página
  revalidatePath('/dashboard/settings')

  return {
    success: true,
    message: 'Chave da API salva com sucesso',
  }
}

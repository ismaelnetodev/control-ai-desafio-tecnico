'use server'

import { createClient } from '@/utils/supabase/server'
import { encrypt } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveApiKey(formData: FormData) {
  const apiKey = formData.get('apiKey') as string

  if (!apiKey || apiKey.trim() === '') {
    redirect('/dashboard/settings?error=api_key_required')
  }

  // Validar se a chave começa com "sk-"
  if (!apiKey.startsWith('sk-')) {
    redirect('/dashboard/settings?error=invalid_api_key_format')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil e empresa do usuário
  const { data: perfil, error: perfilError } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (perfilError || !perfil?.empresa_id) {
    redirect('/dashboard/settings?error=company_not_found')
  }

  // Criptografar a chave da API
  let encryptedKey: string
  try {
    encryptedKey = encrypt(apiKey)
  } catch (error) {
    console.error('Erro ao criptografar chave:', error)
    redirect('/dashboard/settings?error=encryption_failed')
  }

  // Atualizar a tabela empresas com a chave criptografada
  const { error: updateError } = await supabase
    .from('empresas')
    .update({ api_key_encrypted: encryptedKey })
    .eq('id', perfil.empresa_id)

  if (updateError) {
    console.error('Erro ao atualizar empresa:', updateError)
    redirect('/dashboard/settings?error=save_failed')
  }

  // Revalidar o caminho para atualizar a página
  revalidatePath('/dashboard/settings')
  
  // Redirecionar com sucesso
  redirect('/dashboard/settings?success=true')
}
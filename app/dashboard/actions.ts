'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function logoutAction() {
  const supabase = await createClient()
  
  // 1. Faz o SignOut no Supabase (Backend)
  await supabase.auth.signOut()
  
  // 2. Limpa o cache de todo o layout para evitar que dados antigos apareçam
  revalidatePath('/', 'layout')
  
  // 3. Redireciona
  redirect('/login')
}
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!perfil?.is_super_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <h1 className="font-bold text-xl tracking-tight">ControlAI <span className="text-emerald-500">MASTER</span></h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>{user.email}</span>
          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Super Admin</span>
        </div>
      </header>
      <main className="p-8">
        {children}
      </main>
    </div>
  )
}
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from './actions'
import { LogOut, ShieldCheck } from 'lucide-react' // Importei o ShieldCheck
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'
import Link from 'next/link' // Importei o Link

export default async function DashboardLayout({
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

  // Buscar dados do perfil e empresa
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*, empresas(*)')
    .eq('id', user.id)
    .single()

  const empresaNome = perfil?.empresas?.nome || 'Sua Empresa'
  const userEmail = user.email || ''
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0]
  const isSuperAdmin = perfil?.is_super_admin // Pegamos a flag aqui
  
  // Lógica para iniciais do nome
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarContent>
          <div className="mb-6 px-3">
            <h2 className="text-lg font-semibold text-foreground">
              Control AI
            </h2>
            <p className="text-xs text-muted-foreground">{empresaNome}</p>
          </div>
          <SidebarMenu />
        </SidebarContent>
      </Sidebar>

      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* --- ITEM DE SUPER ADMIN (Só aparece se tiver a flag) --- */}
              {isSuperAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/master" className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Painel Master</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Botão de Sair */}
              <div className="p-1">
                <form action={logoutAction}>
                  <button 
                    type="submit" 
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </form>
              </div>

            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, MessageSquare, Activity } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Verificar usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Buscar perfil e empresa
  const { data: perfil } = await supabase
    .from('perfis')
    .select('*, empresas(*)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) {
    redirect('/login')
  }

  // Correção do erro de TypeScript
  const empresasData = perfil.empresas as { nome: string; plano: string } | { nome: string; plano: string }[] | null
  let empresaNome = 'Sua Empresa'
  let planoAtual = 'free'
  
  if (empresasData) {
    if (Array.isArray(empresasData)) {
      empresaNome = empresasData[0]?.nome || 'Sua Empresa'
      planoAtual = empresasData[0]?.plano || 'free'
    } else {
      empresaNome = empresasData.nome || 'Sua Empresa'
      planoAtual = empresasData.plano || 'free'
    }
  }

  // 3. Buscar Métricas (KPIs)
  
  // Total de Agentes
  const { count: totalAgentes } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', perfil.empresa_id)

  // Total de Conversas
  const { count: totalConversas } = await supabase
    .from('conversas')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', perfil.empresa_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel da {empresaNome}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Agentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgentes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Assistentes configurados
            </p>
          </CardContent>
        </Card>

        {/* Card Conversas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Interações registradas
            </p>
          </CardContent>
        </Card>

        {/* Card Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Conta</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {planoAtual}
            </div>
            <p className="text-xs text-muted-foreground">
              Plano atual
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
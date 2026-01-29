import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MessageSquare, Zap, Bot } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Verificação de Usuário
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Buscar dados da empresa (Necessário para filtrar os dados)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(nome)')
    .eq('id', user.id)
    .single()

  // Correção do erro de TypeScript
  const empresasData = perfil?.empresas as { nome: string } | { nome: string }[] | null
  let empresaNome = 'Sua Empresa'
  
  if (empresasData) {
    if (Array.isArray(empresasData)) {
      empresaNome = empresasData[0]?.nome || 'Sua Empresa'
    } else {
      empresaNome = empresasData.nome || 'Sua Empresa'
    }
  }
  
  const empresaId = perfil?.empresa_id

  // Se não tiver empresa (erro de cadastro), interrompe visualização
  if (!empresaId) return null

  // 3. BUSCA DE DADOS REAIS (Em paralelo para carregar rápido)
  const [conversasReq, tokensReq, agentesReq] = await Promise.all([
    // A: Conta quantas conversas essa empresa tem
    supabase
      .from('conversas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId),

    // B: Pega todas as linhas de uso para somar
    supabase
      .from('uso_recursos')
      .select('quantidade')
      .eq('empresa_id', empresaId),

    // C: Conta quantos agentes existem
    supabase
      .from('agentes_ia')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId),
  ])

  // 4. Processamento dos Números
  const totalConversas = conversasReq.count || 0
  
  // Soma manual dos tokens
  const totalTokens = tokensReq.data?.reduce((acc, curr) => acc + (curr.quantidade || 0), 0) || 0
  
  const totalAgentes = agentesReq.count || 0

  // Função para formatar números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  // 5. Definição dos Cards com valores dinâmicos
  const stats = [
    {
      title: 'Total de Conversas',
      value: formatNumber(totalConversas),
      description: 'Número total de conversas realizadas',
      icon: MessageSquare,
    },
    {
      title: 'Tokens Usados',
      value: formatNumber(totalTokens),
      description: 'Total de tokens consumidos',
      icon: Zap,
    },
    {
      title: 'Agentes Ativos',
      value: formatNumber(totalAgentes),
      description: 'Agentes de IA em funcionamento',
      icon: Bot,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo à {empresaNome}
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus agentes de IA e monitore o uso de recursos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs mt-1">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
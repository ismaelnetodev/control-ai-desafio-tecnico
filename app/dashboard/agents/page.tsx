import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Bot, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { deleteAgent } from './actions'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'

export default async function AgentsPage() {
  const supabase = await createClient()
  
  // 1. Busca usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Busca empresa E os limites do plano
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(max_agentes, plano)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) redirect('/dashboard')

  // --- CORREÇÃO DE TIPO (Igual ao Dashboard) ---
  const empresaData = perfil.empresas as any
  const empresa = Array.isArray(empresaData) ? empresaData[0] : empresaData
  const maxAgentes = empresa?.max_agentes || 1
  // ---------------------------------------------

  // 3. Busca Agentes
  const { data: agentes } = await supabase
    .from('agentes_ia')
    .select('*')
    .eq('empresa_id', perfil.empresa_id)
    .order('created_at', { ascending: false })

  // 4. Verifica se atingiu o limite
  const totalAgentes = agentes?.length || 0
  const isLimitReached = totalAgentes >= maxAgentes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground">
            Gerencie seus assistentes ({totalAgentes} / {maxAgentes} utilizados)
          </p>
        </div>
        
        {/* LOGICA DO BOTÃO: Se atingiu limite, mostra botão de Upgrade */}
        {isLimitReached ? (
          <Link href="/dashboard/subscription">
            <Button variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Zap className="mr-2 h-4 w-4" /> Aumentar Limite
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/agents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Agente
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Estado Vazio */}
        {agentes?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-50 border border-dashed rounded-lg">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum agente criado ainda.</p>
            <Link href="/dashboard/agents/new" className="mt-4">
               <Button variant="outline">Criar meu primeiro agente</Button>
            </Link>
          </div>
        )}

        {/* Lista de Agentes */}
        {agentes?.map((agente) => (
          <Card key={agente.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  {agente.nome}
                </CardTitle>
                <Badge variant="outline">{agente.modelo}</Badge>
              </div>
              <CardDescription className="line-clamp-1">
                 ID: {agente.id.slice(0, 8)}...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                {agente.prompt_sistema}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                 <div className={`h-2 w-2 rounded-full ${agente.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                 {agente.ativo ? 'Ativo' : 'Inativo'}
              </div>
              
              <form action={deleteAgent}>
                <input type="hidden" name="id" value={agente.id} />
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
        
        {/* Card Fantasma (Upsell) se estiver no limite */}
        {isLimitReached && (
           <Link href="/dashboard/subscription" className="block h-full">
             <div className="h-full border border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-slate-50 transition-colors cursor-pointer gap-2">
                <Lock className="h-8 w-8 opacity-50" />
                <span className="font-medium">Limite do plano atingido</span>
                <span className="text-xs text-center">Faça upgrade para criar mais agentes</span>
             </div>
           </Link>
        )}
      </div>
    </div>
  )
}
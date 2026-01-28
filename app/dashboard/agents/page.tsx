import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Bot } from 'lucide-react'
import Link from 'next/link'
import { deleteAgent } from './actions'

export default async function AgentsPage() {
  const supabase = await createClient()
  
  // Busca usuário e empresa
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  // Busca Agentes
  const { data: agentes } = await supabase
    .from('agentes_ia')
    .select('*')
    .eq('empresa_id', perfil?.empresa_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground">
            Crie personas personalizadas para auxiliar sua equipe.
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Agente
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agentes?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-50 border border-dashed rounded-lg">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p>Nenhum agente criado ainda.</p>
            <Link href="/dashboard/agents/new" className="mt-4">
               <Button variant="outline">Criar meu primeiro agente</Button>
            </Link>
          </div>
        )}

        {agentes?.map((agente) => (
          <Card key={agente.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  {agente.nome}
                </CardTitle>
              </div>
              <CardDescription>Modelo: {agente.modelo}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {agente.prompt_sistema}
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <form action={deleteAgent}>
                <input type="hidden" name="id" value={agente.id} />
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
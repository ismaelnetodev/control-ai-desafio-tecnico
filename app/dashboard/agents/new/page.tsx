import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // Certifique-se que o Textarea existe
import { Label } from '@/components/ui/label' // Certifique-se que o Label existe
import Link from 'next/link'
import { createAgent } from '../actions'

export default async function NewAgentPage() {
  const supabase = await createClient()

  // 1. Verificação de Segurança e Limites
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(max_agentes)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) redirect('/dashboard')

  const dadosEmpresa = perfil.empresas as any
  const maxAgentes = dadosEmpresa?.max_agentes || 1
  const empresaId = perfil.empresa_id

  // Conta agentes atuais
  const { count } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)

  const currentAgentes = count || 0

  if (currentAgentes >= maxAgentes) {
    redirect('/dashboard/subscription')
  }

  // --- Renderização do Formulário (Se passou no teste) ---
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Novo Agente</h1>
        <p className="text-muted-foreground">Defina a personalidade e o conhecimento da IA.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Agente</CardTitle>
          <CardDescription>
            Configure como este agente deve se comportar ao interagir com a equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAgent} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Agente</Label>
              <Input 
                id="nome" 
                name="nome" 
                placeholder="Ex: Especialista em RH" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt do Sistema (Instruções)</Label>
              <Textarea 
                id="prompt" 
                name="prompt" 
                placeholder="Ex: Você é um assistente de RH útil e amigável..." 
                className="min-h-[150px]"
                required 
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/dashboard/agents">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
              <Button type="submit">Criar Agente</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
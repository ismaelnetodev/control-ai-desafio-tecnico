import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { createAgent } from '../actions'

export default async function NewAgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(max_agentes)')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) redirect('/dashboard')

  const empresaData = perfil.empresas as any
  const empresa = Array.isArray(empresaData) ? empresaData[0] : empresaData
  const maxAgentes = empresa?.max_agentes || 1

  const { count } = await supabase
    .from('agentes_ia')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', perfil.empresa_id)
    .eq('ativo', true)

  if ((count || 0) >= maxAgentes) redirect('/dashboard/subscription')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Novo Agente</h1>
        <p className="text-muted-foreground">Defina a personalidade e o modelo de IA.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Agente</CardTitle>
          <CardDescription>Configure como a IA deve se comportar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAgent} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Agente</Label>
              <Input id="nome" name="nome" placeholder="Ex: Especialista em Vendas" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo de IA</Label>
              <Select name="modelo" defaultValue="gpt-4o-mini">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (OpenAI)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt do Sistema</Label>
              <Textarea 
                id="prompt" 
                name="prompt" 
                placeholder="Ex: Você é um assistente especialista em..." 
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
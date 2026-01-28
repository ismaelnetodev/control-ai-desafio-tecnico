import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { createAgent } from '../actions'

export default function NewAgentPage() {
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
                placeholder="Ex: Você é um assistente de RH útil e amigável. Responda dúvidas sobre benefícios..." 
                className="min-h-[150px]"
                required 
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Estas instruções definem a "personalidade" e as regras da IA.
              </p>
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
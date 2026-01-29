import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap } from 'lucide-react'
import { upgradePlan, downgradePlan } from './actions'
import { Badge } from '@/components/ui/badge'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Buscar plano atual
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(plano)')
    .eq('id', user.id)
    .single()

  // Correção do erro de TypeScript
  const empresasData = perfil?.empresas as { plano: string } | { plano: string }[] | null
  let planoAtual = 'free'
  
  if (empresasData) {
    if (Array.isArray(empresasData)) {
      planoAtual = empresasData[0]?.plano || 'free'
    } else {
      planoAtual = empresasData.plano || 'free'
    }
  }

  const isPro = planoAtual === 'pro'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie o plano da sua empresa e seus limites.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-4xl">
        
        {/* PLANO FREE */}
        <Card className={`flex flex-col ${!isPro ? 'border-primary shadow-md' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Starter</CardTitle>
                {!isPro && <Badge>Atual</Badge>}
            </div>
            <CardDescription>Para testar e validar.</CardDescription>
            <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 1 Agente de IA</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Histórico de 3 dias</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Suporte Básico</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
                 <form action={downgradePlan} className="w-full">
                    <Button variant="outline" className="w-full">Voltar para Grátis</Button>
                 </form>
            ) : (
                <Button disabled className="w-full" variant="secondary">Seu plano atual</Button>
            )}
          </CardFooter>
        </Card>

        {/* PLANO PRO */}
        <Card className={`flex flex-col relative overflow-hidden ${isPro ? 'border-primary shadow-lg bg-primary/5' : ''}`}>
          {isPro && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                ATIVO
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                Pro <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardTitle>
            <CardDescription>Para empresas em crescimento.</CardDescription>
            <div className="mt-4">
                <span className="text-4xl font-bold">R$ 99</span>
                <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> <strong>Agentes Ilimitados</strong></li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Histórico Ilimitado</li>
                <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Suporte Prioritário</li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
                <Button disabled className="w-full">Plano Ativo</Button>
            ) : (
                <form action={upgradePlan} className="w-full">
                    <Button type="submit" className="w-full">Assinar Agora</Button>
                </form>
            )}
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
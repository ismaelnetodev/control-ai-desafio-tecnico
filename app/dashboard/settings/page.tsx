import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, Lock, Zap } from 'lucide-react'
import { SettingsForm } from '@/components/dashboard/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(api_key_encrypted, anthropic_key_encrypted)')
    .eq('id', user.id)
    .single()

  const empresaData = perfil?.empresas as any
  const empresa = Array.isArray(empresaData) ? empresaData[0] : empresaData
  
  const hasOpenAiKey = !!(empresa?.api_key_encrypted)
  const hasAnthropicKey = !!(empresa?.anthropic_key_encrypted)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas chaves de API (BYOK).</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-600" />
            <CardTitle>OpenAI (GPT-4)</CardTitle>
          </div>
          <CardDescription>Necessário para modelos GPT-4o e GPT-4o-mini.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm 
            hasApiKey={hasOpenAiKey} 
            provider="openai" 
            label="Chave OpenAI (sk-...)" 
            placeholder="sk-..." 
            helpText='A chave deve começar com "sk-".'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <CardTitle>Anthropic (Claude 3.5)</CardTitle>
          </div>
          <CardDescription>Necessário para modelos Claude 3.5 Sonnet.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm 
            hasApiKey={hasAnthropicKey} 
            provider="anthropic" 
            label="Chave Anthropic (sk-ant-...)" 
            placeholder="sk-ant-..." 
            helpText='A chave deve começar com "sk-ant-".'
          />
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base">Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Suas chaves são criptografadas com AES-256-GCM antes do armazenamento.
            Elas são descriptografadas apenas em memória no momento da execução.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
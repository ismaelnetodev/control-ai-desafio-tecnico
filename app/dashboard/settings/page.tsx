import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Key, CheckCircle2, Lock } from 'lucide-react'
import { SettingsForm } from '@/components/dashboard/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados da empresa para verificar se já existe uma chave salva
  const { data: perfil } = await supabase
    .from('perfis')
    .select('empresa_id, empresas(api_key_encrypted)')
    .eq('id', user.id)
    .single()

  // Verificar se existe uma chave criptografada
  const empresa = perfil?.empresas as { api_key_encrypted: string | null } | null
  const hasApiKey = !!(empresa?.api_key_encrypted)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações da sua conta e empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Chave da API (BYOK)</CardTitle>
          </div>
          <CardDescription>
            Configure sua própria chave da API OpenAI. A chave é criptografada
            e armazenada com segurança usando criptografia AES-256.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm hasApiKey={hasApiKey} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Segurança</CardTitle>
          </div>
          <CardDescription>
            Sua chave da API é criptografada usando AES-256-GCM antes de ser
            armazenada no banco de dados. Apenas você pode descriptografá-la
            quando necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Criptografia Ativa</p>
              <p className="text-xs text-muted-foreground">
                Todas as chaves são criptografadas antes do armazenamento usando
                algoritmos de criptografia de nível empresarial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

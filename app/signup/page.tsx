import { signupAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    missing_fields: 'Todos os campos são obrigatórios',
    auth_error: 'Erro ao criar conta. Email pode já estar em uso.',
    user_creation_failed: 'Falha ao criar usuário',
    company_creation_failed: 'Erro ao criar empresa',
    profile_link_failed: 'Erro ao vincular perfil',
  }

  const errorMessage = searchParams.error ? errorMessages[searchParams.error] : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <form action={signupAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Minha Empresa Ltda"
                required
                autoComplete="organization"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Seu Nome</Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                placeholder="João Silva"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Criar conta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
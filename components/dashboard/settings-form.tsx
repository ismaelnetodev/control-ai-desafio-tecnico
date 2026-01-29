'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveApiKey } from '@/app/dashboard/settings/actions'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface SettingsFormProps {
  hasApiKey: boolean
}

export function SettingsForm({ hasApiKey }: SettingsFormProps) {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    api_key_required: 'A chave da API é obrigatória',
    invalid_api_key_format: 'A chave da API deve começar com "sk-"',
    company_not_found: 'Erro ao buscar dados da empresa',
    encryption_failed: 'Erro ao criptografar a chave da API',
    save_failed: 'Erro ao salvar a chave da API',
  }

  const errorMessage = error ? errorMessages[error] : null

  return (
    <form action={saveApiKey} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">Chave da API OpenAI</Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          placeholder={
            hasApiKey
              ? '••••••••••••••••••••••••••••••••'
              : 'sk-...'
          }
          required
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          {hasApiKey
            ? 'Uma chave já está configurada. Digite uma nova chave para substituir.'
            : 'Digite sua chave da API OpenAI. Ela deve começar com "sk-".'}
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm">Chave da API salva com sucesso!</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <Button type="submit" className="w-full sm:w-auto">
        {hasApiKey ? 'Atualizar Chave' : 'Salvar Chave'}
      </Button>
    </form>
  )
}
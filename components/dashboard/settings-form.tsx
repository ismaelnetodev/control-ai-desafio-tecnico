'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveApiKey } from '@/app/dashboard/settings/actions'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface SettingsFormProps {
  hasApiKey: boolean
}

export function SettingsForm({ hasApiKey }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  async function handleSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await saveApiKey(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        setMessage({ type: 'success', text: result.message || 'Chave salva com sucesso!' })
        // Limpar o campo após sucesso
        const form = document.getElementById('api-key-form') as HTMLFormElement
        if (form) {
          form.reset()
        }
      }
    })
  }

  return (
    <form id="api-key-form" action={handleSubmit} className="space-y-4">
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
          disabled={isPending}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          {hasApiKey
            ? 'Uma chave já está configurada. Digite uma nova chave para substituir.'
            : 'Digite sua chave da API OpenAI. Ela deve começar com "sk-".'}
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
              : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : hasApiKey ? (
          'Atualizar Chave'
        ) : (
          'Salvar Chave'
        )}
      </Button>
    </form>
  )
}

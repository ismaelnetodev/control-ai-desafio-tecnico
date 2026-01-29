'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, MessageSquare, PlusCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipos
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Agent {
  id: string
  nome: string
  modelo: string
}

interface Conversa {
  id: string
  created_at: string
  titulo?: string
}

export default function ChatPage() {
  const supabase = createClient()
  
  // Estados de Dados
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversas, setConversas] = useState<Conversa[]>([])
  
  // Estados de Seleção
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [conversaId, setConversaId] = useState<string | null>(null)
  
  // Estados de UI
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Inicialização: Carregar Agentes e Lista de Conversas
  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('id', user.id)
        .single()
      
      if (perfil?.empresa_id) {
        // Buscar Agentes
        const { data: agentsData } = await supabase
          .from('agentes_ia')
          .select('id, nome, modelo')
          .eq('empresa_id', perfil.empresa_id)
          .eq('ativo', true)
        
        if (agentsData && agentsData.length > 0) {
          setAgents(agentsData)
          setSelectedAgentId(agentsData[0].id)
        }

        // Buscar Histórico de Conversas
        fetchConversas(perfil.empresa_id)
      }
    }
    initData()
  }, [])

  // Função auxiliar para buscar a lista de conversas no banco
  async function fetchConversas(empresaId: string) {
    const { data } = await supabase
      .from('conversas')
      .select('id, created_at, titulo')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
    
    if (data) setConversas(data)
  }

  // 2. Carregar mensagens de uma conversa específica (Histórico)
  const loadConversation = async (id: string) => {
    setIsLoading(true)
    setConversaId(id)
    setMessages([]) // Limpa a tela visualmente enquanto carrega
    setError(null)
    
    const { data } = await supabase
      .from('mensagens')
      .select('role, conteudo')
      .eq('conversa_id', id)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data.map(m => ({ 
        role: m.role as 'user' | 'assistant', 
        content: m.conteudo 
      })))
    }
    setIsLoading(false)
  }

  // 3. Resetar para criar nova conversa
  const startNewChat = () => {
    setConversaId(null)
    setMessages([])
    setStreamingMessage('')
    setError(null)
  }

  // Scroll automático para o fundo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  // Envio de Mensagem
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const userMessage = input.trim()
    if (!userMessage || isLoading) return

    // UI Otimista
    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages((prev) => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessage('')
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversa_id: conversaId,
          agent_id: selectedAgentId
        }),
      })

      if (!response.ok) {
        // Tentar extrair mensagem de erro do servidor
        let errorMessage = 'Erro na requisição'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Se a conversa era nova (conversaId null), atualizamos a lista lateral
      if (!conversaId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
           // Pequeno delay para garantir que o banco processou a criação
           setTimeout(async () => {
              const { data: perfil } = await supabase.from('perfis').select('empresa_id').eq('id', user.id).single()
              if (perfil) fetchConversas(perfil.empresa_id)
           }, 1000)
        }
      }

      // Processamento da Resposta (Stream vs JSON)
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } else {
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Stream não disponível')
        }
        const decoder = new TextDecoder()
        let assistantContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk
          setStreamingMessage(assistantContent)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }])
        setStreamingMessage('')
      }

    } catch (error) {
      console.error('Erro no chat:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar mensagem'
      setError(errorMessage)
      
      // Remove a mensagem do usuário em caso de erro
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const currentAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      
      {/* --- SIDEBAR DE HISTÓRICO --- */}
      <Card className="w-64 hidden md:flex flex-col overflow-hidden bg-slate-50/50">
        <div className="p-4 border-b">
          <Button onClick={startNewChat} className="w-full gap-2" variant="outline">
            <PlusCircle className="h-4 w-4" /> Nova Conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversas.length === 0 && (
             <p className="text-xs text-center text-muted-foreground py-4">Sem histórico</p>
          )}
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={cn(
                "w-full text-left text-xs p-3 rounded-md transition-colors flex flex-col gap-1 truncate hover:bg-white hover:shadow-sm",
                conversaId === c.id ? "bg-white shadow-sm font-medium border" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span className="truncate font-medium">
                  {c.titulo || 'Conversa sem título'}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(c.created_at).toLocaleDateString()} às {new Date(c.created_at).toLocaleTimeString().slice(0,5)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* --- ÁREA PRINCIPAL DO CHAT --- */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
        {/* Header do Chat */}
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">{currentAgent?.nome || 'Agente IA'}</p>
              <p className="text-xs text-muted-foreground">{currentAgent?.modelo || 'GPT-4o'}</p>
            </div>
          </div>
          <div className="w-[200px]">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId} disabled={messages.length > 0 && !!conversaId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione Agente" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.length === 0 && !error && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <Bot className="h-12 w-12 mb-4" />
              <p>Inicie uma nova conversa com {currentAgent?.nome}</p>
            </div>
          )}
          
          {messages.map((m, idx) => (
            <div key={idx} className={cn("flex gap-3", m.role === 'user' ? "justify-end" : "justify-start")}>
              {m.role === 'assistant' && (
                 <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                 </div>
              )}
              <div className={cn(
                "max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm",
                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-white border"
              )}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {/* Mensagem sendo digitada (Stream) */}
          {streamingMessage && (
             <div className="flex gap-3 justify-start">
               <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center"><Bot className="h-4 w-4" /></div>
               <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-white border shadow-sm">
                 <p className="whitespace-pre-wrap">{streamingMessage}</p>
               </div>
             </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-red-50 border border-red-200 text-red-900">
                <p className="font-semibold mb-1">Erro ao processar mensagem</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de Texto */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..." 
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
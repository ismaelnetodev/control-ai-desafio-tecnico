'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bot, User, Send, Loader2, MessageSquare, PlusCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

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
}

export default function ChatPage() {
  const supabase = createClient()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversas, setConversas] = useState<Conversa[]>([])
  
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [conversaId, setConversaId] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function initData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id, empresas(plano)')
        .eq('id', user.id)
        .single()
      
      if (perfil?.empresa_id) {
        const dadosEmpresa = perfil.empresas as any
        const plano = dadosEmpresa?.plano || 'free'
        setIsPro(plano === 'pro')

        const { data: agentsData } = await supabase
          .from('agentes_ia')
          .select('id, nome, modelo')
          .eq('empresa_id', perfil.empresa_id)
          .eq('ativo', true)
        
        if (agentsData && agentsData.length > 0) {
          setAgents(agentsData)
          setSelectedAgentId(agentsData[0].id)
        }

        fetchConversas(perfil.empresa_id, plano)
      }
    }
    initData()
  }, [])

  async function fetchConversas(empresaId: string, plano: string) {
    let query = supabase
      .from('conversas')
      .select('id, created_at')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
    
    if (plano === 'free') {
      const tresDiasAtras = new Date()
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)
      query = query.gte('created_at', tresDiasAtras.toISOString())
    }
    
    const { data } = await query
    if (data) setConversas(data)
  }

  const loadConversation = async (id: string) => {
    setIsLoading(true)
    setConversaId(id)
    setMessages([])
    
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

  const startNewChat = () => {
    setConversaId(null)
    setMessages([])
    setStreamingMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const userMessage = input.trim()
    if (!userMessage || isLoading) return

    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages((prev) => [...prev, newUserMessage])
    setInput('')
    setIsLoading(true)
    setStreamingMessage('')

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

      if (!response.ok) throw new Error('Erro na requisição')

      if (!conversaId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
           setTimeout(async () => {
              const { data: perfil } = await supabase.from('perfis').select('empresa_id, empresas(plano)').eq('id', user.id).single()
              if (perfil) {
                const dadosEmpresa = perfil.empresas as any
                fetchConversas(perfil.empresa_id, dadosEmpresa?.plano || 'free')
              }
           }, 1000)
        }
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } else {
        const reader = response.body?.getReader()
        if (!reader) return
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
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar mensagem.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const currentAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      
      <Card className="w-64 hidden md:flex flex-col overflow-hidden bg-slate-50/50">
        <div className="p-4 border-b">
          <Button onClick={startNewChat} className="w-full gap-2" variant="outline">
            <PlusCircle className="h-4 w-4" /> Nova Conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversas.length === 0 && (
             <div className="text-center py-4 space-y-2">
                <p className="text-xs text-muted-foreground">Sem histórico recente</p>
                {!isPro && (
                  <p className="text-[10px] text-muted-foreground px-2">
                    O histórico antigo é ocultado no plano Free.
                  </p>
                )}
             </div>
          )}
          
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={cn(
                "w-full text-left text-xs p-3 rounded-md transition-colors flex items-center gap-2 truncate hover:bg-white hover:shadow-sm",
                conversaId === c.id ? "bg-white shadow-sm font-medium border" : "text-muted-foreground"
              )}
            >
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {new Date(c.created_at).toLocaleDateString()} às {new Date(c.created_at).toLocaleTimeString().slice(0,5)}
              </span>
            </button>
          ))}
        </div>
        
        {!isPro && conversas.length > 0 && (
          <div className="p-3 border-t bg-slate-100/50">
            <Link href="/dashboard/subscription">
              <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Lock className="h-3 w-3" />
                <span>Ver histórico antigo</span>
              </div>
            </Link>
          </div>
        )}
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {messages.length === 0 && (
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

          {streamingMessage && (
             <div className="flex gap-3 justify-start">
               <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center"><Bot className="h-4 w-4" /></div>
               <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-white border shadow-sm">
                 <p className="whitespace-pre-wrap">{streamingMessage}</p>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
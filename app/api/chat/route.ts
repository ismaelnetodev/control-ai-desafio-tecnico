import { createClient } from '@/utils/supabase/server'
import { decrypt } from '@/lib/crypto'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs' 

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // 1. Contexto da Empresa e Chaves
    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (!perfil?.empresa_id) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

    const { data: empresa } = await supabase
      .from('empresas')
      .select('api_key_encrypted, anthropic_key_encrypted')
      .eq('id', perfil.empresa_id)
      .single()

    // 2. Dados da Requisição
    const body = await request.json()
    const { message, conversa_id, agent_id } = body

    if (!message) return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })

    // 3. Determinar Modelo
    let modelToUse = 'gpt-4o-mini'
    let systemPrompt = 'Você é um assistente útil.'

    if (agent_id) {
      const { data: agente } = await supabase
        .from('agentes_ia')
        .select('modelo, prompt_sistema')
        .eq('id', agent_id)
        .single()
      
      if (agente) {
        if (agente.modelo) modelToUse = agente.modelo
        if (agente.prompt_sistema) systemPrompt = agente.prompt_sistema
      }
    }

    const isClaude = modelToUse.startsWith('claude')
    let streamIterator: any

    // --- ROTA ANTHROPIC (CLAUDE) ---
    if (isClaude) {
        if (!empresa?.anthropic_key_encrypted) {
            return NextResponse.json({ error: 'Chave Anthropic não configurada' }, { status: 400 })
        }

        let apiKey: string
        try {
            apiKey = decrypt(empresa.anthropic_key_encrypted)
        } catch (e) {
            return NextResponse.json({ error: 'Erro ao descriptografar chave Anthropic' }, { status: 500 })
        }

        const anthropic = new Anthropic({ apiKey })
        
        const stream = await anthropic.messages.create({
            model: modelToUse,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
            stream: true,
        })
        streamIterator = stream
    } 
    // --- ROTA OPENAI (GPT) ---
    else {
        if (!empresa?.api_key_encrypted) {
             return NextResponse.json({ error: 'Chave OpenAI não configurada' }, { status: 400 })
        }

        let apiKey: string
        try {
            apiKey = decrypt(empresa.api_key_encrypted)
        } catch (e) {
            return NextResponse.json({ error: 'Erro ao descriptografar chave OpenAI' }, { status: 500 })
        }

        const openai = new OpenAI({ apiKey })
        
        const stream = await openai.chat.completions.create({
            model: modelToUse,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            stream: true,
        })
        streamIterator = stream
    }

    // 5. Streaming Unificado
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        
        try {
          for await (const chunk of streamIterator) {
            let content = ''
            
            if (isClaude) {
                // Anthropic chunks
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    content = chunk.delta.text
                }
            } else {
                // OpenAI chunks
                content = chunk.choices?.[0]?.delta?.content || ''
            }

            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
          }

          const totalTokens = Math.ceil(fullResponse.length / 4) + Math.ceil(message.length / 4)
          await saveMessagesAndUsage(
              supabase, 
              perfil.empresa_id, 
              user.id, 
              conversa_id, 
              message, 
              fullResponse, 
              totalTokens,
              modelToUse,
              agent_id
          )

          controller.close()
        } catch (err) {
          console.error('Stream Error:', err)
          controller.error(err)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error: any) {
    console.error('Erro Geral:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

async function saveMessagesAndUsage(
  supabase: any,
  empresaId: string,
  userId: string,
  conversaId: string | null,
  userMessage: string,
  assistantResponse: string,
  tokensUsed: number,
  model: string,
  agentId?: string
) {
    let finalConversaId = conversaId
    if (!finalConversaId) {
        const titulo = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '')
        const { data: nova } = await supabase.from('conversas').insert({
            empresa_id: empresaId,
            usuario_id: userId,
            titulo,
            agente_id: agentId
        }).select('id').single()
        if (nova) finalConversaId = nova.id
    }

    if (!finalConversaId) return

    await supabase.from('mensagens').insert({
        conversa_id: finalConversaId,
        role: 'user',
        conteudo: userMessage
    })

    await supabase.from('mensagens').insert({
        conversa_id: finalConversaId,
        role: 'assistant',
        conteudo: assistantResponse
    })

    await supabase.from('auditoria').insert({
        empresa_id: empresaId,
        user_id: userId,
        acao: 'chat_usage',
        detalhes: {
            provider: model.startsWith('claude') ? 'anthropic' : 'openai',
            model: model,
            tokens: tokensUsed,
            agent_id: agentId,
            conversa_id: finalConversaId
        }
    })
}
import { createClient } from '@/utils/supabase/server'
import { decrypt } from '@/lib/crypto'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Buscar empresa_id do usuário
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (perfilError || !perfil?.empresa_id) {
      return NextResponse.json(
        { error: 'Erro ao buscar dados da empresa' },
        { status: 500 }
      )
    }

    // 3. Buscar e descriptografar a chave da API
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('api_key_encrypted')
      .eq('id', perfil.empresa_id)
      .single()

    if (empresaError || !empresa?.api_key_encrypted) {
      return NextResponse.json(
        { error: 'Chave da API não configurada' },
        { status: 400 }
      )
    }

    let apiKey: string
    try {
      apiKey = decrypt(empresa.api_key_encrypted)
    } catch (error) {
      console.error('Erro ao descriptografar chave:', error)
      return NextResponse.json(
        { error: 'Erro ao descriptografar chave da API' },
        { status: 500 }
      )
    }

    // 4. Obter dados da requisição
    const body = await request.json()
    const { message, conversa_id, agent_id } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // 5. Verificar se é mock ou real
    const isMock = apiKey.startsWith('sk-teste') || !apiKey.startsWith('sk-')

    let assistantResponse = ''
    let tokensUsed = 0

    if (isMock) {
      // Simular resposta de IA (aguardar 1s)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      assistantResponse =
        'Esta é uma resposta simulada da IA. Configure uma chave da API real em Configurações para usar o ChatGPT.'
      tokensUsed = 100 // Mock: 100 tokens
    } else {
      // Chamada real à OpenAI com streaming
      const openai = new OpenAI({
        apiKey: apiKey,
      })

      // Buscar histórico da conversa se existir
      let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
      
      // Adicionar prompt do sistema do agente se existir
      if (agent_id) {
        const { data: agente } = await supabase
          .from('agentes_ia')
          .select('prompt_sistema')
          .eq('id', agent_id)
          .single()
        
        if (agente?.prompt_sistema) {
          messages.push({
            role: 'system',
            content: agente.prompt_sistema,
          })
        }
      }
      
      if (conversa_id) {
        const { data: historico } = await supabase
          .from('mensagens')
          .select('conteudo, role')
          .eq('conversa_id', conversa_id)
          .order('created_at', { ascending: true })
          .limit(20) // Limitar histórico

        if (historico) {
          messages = [
            ...messages,
            ...historico.map((msg) => ({
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.conteudo,
            }))
          ]
        }
      }

      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: message,
      })

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        stream: true,
      })

      // Criar stream de resposta
      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          let fullResponse = ''
          let totalTokens = 0

          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                controller.enqueue(encoder.encode(content))
              }
            }

            // Estimar tokens (aproximadamente 4 caracteres por token)
            totalTokens = Math.ceil(fullResponse.length / 4) + Math.ceil(message.length / 4)

            // Salvar mensagens e uso após stream completo
            await saveMessagesAndUsage(
              supabase,
              perfil.empresa_id,
              user.id,
              conversa_id,
              message,
              fullResponse,
              totalTokens,
              agent_id
            )

            controller.close()
          } catch (error) {
            console.error('Erro no stream:', error)
            controller.error(error)
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    // Para mock, salvar mensagens e uso antes de retornar
    await saveMessagesAndUsage(
      supabase,
      perfil.empresa_id,
      user.id,
      conversa_id,
      message,
      assistantResponse,
      tokensUsed,
      agent_id
    )

    return NextResponse.json({
      message: assistantResponse,
      tokens: tokensUsed,
    })
  } catch (error) {
    console.error('Erro na rota de chat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function saveMessagesAndUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresaId: string,
  userId: string,
  conversaId: string | null | undefined,
  userMessage: string,
  assistantResponse: string,
  tokensUsed: number,
  agentId?: string | null
) {
  try {
    // Criar ou usar conversa existente
    let finalConversaId = conversaId

    if (!finalConversaId) {
      // Criar título a partir da mensagem
      const titulo = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
      
      const { data: novaConversa, error: conversaError } = await supabase
        .from('conversas')
        .insert({
          empresa_id: empresaId,
          usuario_id: userId,
          titulo: titulo,
          agente_id: agentId,
        })
        .select('id')
        .single()

      if (conversaError) {
        console.error('Erro ao criar conversa:', conversaError)
        return
      }

      finalConversaId = novaConversa.id
    }

    // Salvar mensagem do usuário
    const { error: userMsgError } = await supabase.from('mensagens').insert({
      conversa_id: finalConversaId,
      role: 'user',
      conteudo: userMessage,
    })

    if (userMsgError) {
      console.error('Erro ao salvar mensagem do usuário:', userMsgError)
    }

    // Salvar resposta da IA
    const { error: assistantMsgError } = await supabase
      .from('mensagens')
      .insert({
        conversa_id: finalConversaId,
        role: 'assistant',
        conteudo: assistantResponse,
      })

    if (assistantMsgError) {
      console.error('Erro ao salvar mensagem da IA:', assistantMsgError)
    }

    // Salvar uso de recursos
    const { error: usoError } = await supabase.from('uso_recursos').insert({
      empresa_id: empresaId,
      conversa_id: finalConversaId,
      tipo_recurso: 'openai',
      quantidade: tokensUsed,
      metadata: {
        model: 'gpt-4o-mini',
        agent_id: agentId,
      },
    })

    if (usoError) {
      console.error('Erro ao salvar uso de recursos:', usoError)
    }
  } catch (error) {
    console.error('Erro ao salvar auditoria:', error)
  }
}
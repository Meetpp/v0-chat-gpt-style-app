import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Use a proper logging library instead
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No user found")
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, chatId } = await req.json()
    console.log("[v0] Received messages:", messages?.length, "chatId:", chatId)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log("[v0] Invalid messages array")
      return new Response(JSON.stringify({ error: "Invalid messages" }), { status: 400 })
    }

    let finalChatId = chatId

    if (!finalChatId) {
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select()
        .single()

      if (chatError) {
        console.log("[v0] Error creating chat:", chatError)
        throw chatError
      }
      finalChatId = newChat.id
      console.log("[v0] Created new chat:", finalChatId)
    }

    const userMessage = messages[messages.length - 1]
    const { error: messageError } = await supabase.from("messages").insert({
      chat_id: finalChatId,
      role: "user",
      content: userMessage.content,
    })

    if (messageError) {
      console.log("[v0] Error saving user message:", messageError)
      throw messageError
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    let assistantMessage = ""
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) throw new Error("No response body")

          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const json = JSON.parse(data)
                  const content = json.choices?.[0]?.delta?.content
                  if (content) {
                    assistantMessage += content
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          await supabase.from("messages").insert({
            chat_id: finalChatId,
            role: "assistant",
            content: assistantMessage,
          })

          if (messages.length === 1) {
            const title = userMessage.content.slice(0, 50)
            await supabase.from("chats").update({ title }).eq("id", finalChatId)
            console.log("[v0] Updated chat title:", title)
          }

          console.log("[v0] Stream complete")
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("[v0] Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": finalChatId,
      },
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}

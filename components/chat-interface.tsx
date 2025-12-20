"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, User, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

export interface ChatInterfaceProps {
  chatId: string | null
  onChatCreated: (chatId: string) => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface({ chatId, onChatCreated }: ChatInterfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatTitle, setChatTitle] = useState("New Chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadMessages() {
      if (!chatId) {
        setMessages([])
        setChatTitle("New Chat")
        return
      }

      try {
        const response = await fetch(`/api/chats/${chatId}`)
        const data = await response.json()

        if (data.chat) {
          setChatTitle(data.chat.title)
          setMessages(
            data.chat.messages?.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })) || [],
          )
        }
      } catch (error) {
        console.error("[v0] Error loading messages:", error)
      }
    }

    loadMessages()
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("[v0] Sending message with chatId:", chatId)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })),
          chatId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Response error:", errorText)
        throw new Error("Failed to get response")
      }

      const newChatId = response.headers.get("X-Chat-Id")
      console.log("[v0] Got chat ID from response:", newChatId)

      if (newChatId && newChatId !== chatId) {
        onChatCreated(newChatId)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      const assistantId = (Date.now() + 1).toString()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })

          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantMessage += parsed.content

                  setMessages((prev) => {
                    const existing = prev.find((m) => m.id === assistantId)
                    if (existing) {
                      return prev.map((m) => (m.id === assistantId ? { ...m, content: assistantMessage } : m))
                    }
                    return [...prev, { id: assistantId, role: "assistant", content: assistantMessage }]
                  })
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      if (!chatId && messages.length === 0) {
        const title = userMessage.content.slice(0, 50)
        setChatTitle(title)
        console.log("[v0] Updated chat title:", title)
      }

      console.log("[v0] Stream complete")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {!chatId && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-2xl px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              ChatGPT Clone
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your AI assistant for conversations, code, and creative tasks. Start typing below to begin.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{chatTitle}</h2>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 max-height-[76%]">
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0 mt-1">
                      <AvatarFallback
                        className={
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 space-y-2 ${message.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl max-w-full ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed text-pretty break-words">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-none bg-muted">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="w-2 h-2 bg-foreground/40 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-foreground/40 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-foreground/40 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="stickybottom-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-6">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message ChatGPT..."
                  disabled={isLoading}
                  rows={1}
                  className="min-h-[56px] max-h-[200px] resize-none pr-12 rounded-2xl border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="absolute right-2 bottom-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

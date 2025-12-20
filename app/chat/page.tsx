"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { ChatSidebar } from "@/components/chat-sidebar"
import { createClient } from "@/lib/supabase/client"

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      await loadChats()
      setMounted(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function loadChats() {
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const response = await fetch("/api/chats")
      const data = await response.json()

      if (data.chats) {
        setChats(data.chats)
        if (data.chats.length > 0 && !currentChatId) {
          setCurrentChatId(data.chats[0].id)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading chats:", error)
    }
  }

  async function handleCreateNewChat() {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      })

      const data = await response.json()

      if (data.chat) {
        setChats([data.chat, ...chats])
        setCurrentChatId(data.chat.id)
      }
    } catch (error) {
      console.error("[v0] Error creating chat:", error)
    }
  }

  function handleSelectChat(chatId: string) {
    setCurrentChatId(chatId)
  }

  async function handleDeleteChat(chatId: string) {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      const updatedChats = chats.filter((chat) => chat.id !== chatId)
      setChats(updatedChats)

      if (currentChatId === chatId) {
        setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
      }
    } catch (error) {
      console.error("[v0] Error deleting chat:", error)
    }
  }

  if (!mounted || loading) return null

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={handleCreateNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1">
        <ChatInterface chatId={currentChatId} onChatCreated={(chatId) => setCurrentChatId(chatId)} />
      </div>
    </div>
  )
}

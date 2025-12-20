"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PlusCircle, MessageSquare, Trash2, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatSidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onCreateNewChat: () => void
  onDeleteChat: (chatId: string) => void
}

export function ChatSidebar({ chats, currentChatId, onSelectChat, onCreateNewChat, onDeleteChat }: ChatSidebarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 flex flex-col border-r border-border bg-card shadow-lg"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            ChatGPT
          </h1>
        </div>

        <Button
          onClick={onCreateNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                currentChatId === chat.id
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500"
                  : "hover:bg-muted"
              }`}
            >
              <div onClick={() => onSelectChat(chat.id)} className="flex items-start gap-2">
                <MessageSquare
                  className={`w-4 h-4 mt-0.5 shrink-0 ${currentChatId === chat.id ? "text-blue-500" : "text-muted-foreground"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(chat.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                  aria-label="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="border-t border-border p-4 space-y-2 bg-muted/30">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </motion.div>
  )
}

const responses = [
  "That's an interesting question! Let me think about that...",
  "I'd be happy to help you with that. Here are some thoughts:",
  "Great question! This is something many people wonder about.",
  "That's a complex topic. Here's my perspective on it:",
  "Absolutely, I can help you explore this further.",
  "Let me break this down into simpler components for you.",
]

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

export function mockChatResponse(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      resolve(`${randomResponse}\n\n${userMessage.slice(0, 50)}...`)
    }, 800)
  })
}

export function generateChatTitle(firstMessage: string): string {
  return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "")
}

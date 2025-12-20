"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") || "light"
    const isDarkTheme = savedTheme === "dark"
    setIsDark(isDarkTheme)
    if (isDarkTheme) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  function toggleTheme() {
    const newDark = !isDark
    setIsDark(newDark)
    const theme = newDark ? "dark" : "light"
    localStorage.setItem("theme", theme)
    if (newDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) return null

  return (
    <Button onClick={toggleTheme} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
      {isDark ? "☀️" : "🌙"}
    </Button>
  )
}

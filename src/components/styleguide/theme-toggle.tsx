"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // İlk load'da localStorage'dan oku
    const savedTheme = localStorage.getItem("nandd-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
      queueMicrotask(() => setIsDark(true))
    } else {
      document.documentElement.classList.remove("dark")
      queueMicrotask(() => setIsDark(false))
    }
  }, [])

  const handleToggle = (checked: boolean) => {
    setIsDark(checked)
    if (checked) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("nandd-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("nandd-theme", "light")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-toggle" className="text-sm font-medium">
        Dark mode
      </Label>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
      />
    </div>
  )
}


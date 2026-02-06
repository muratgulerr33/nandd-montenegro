"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeSwitch() {
  const { setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/60 p-0 backdrop-blur hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Tema değiştir"
        >
          <Sun className="h-5 w-5 shrink-0 text-foreground dark:hidden" aria-hidden />
          <Moon className="h-5 w-5 shrink-0 text-foreground hidden dark:block" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        Tema değiştir
      </TooltipContent>
    </Tooltip>
  )
}

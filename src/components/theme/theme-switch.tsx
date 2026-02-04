"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="inline-flex h-9 w-20 items-center rounded-full border border-border/60 bg-background/60 px-2 py-1" />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-2 py-1 backdrop-blur hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          {isDark ? (
            <Moon className="h-4 w-4 text-foreground" />
          ) : (
            <Sun className="h-4 w-4 text-foreground" />
          )}
          <Switch
            id="theme-switch"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label={isDark ? "Açık tema" : "Koyu tema"}
          />
          <span className="text-xs text-muted-foreground lg:inline hidden">
            {isDark ? "Koyu" : "Açık"}
          </span>
          <span className="sr-only">Tema</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {isDark ? "Açık moda geç" : "Koyu moda geç"}
      </TooltipContent>
    </Tooltip>
  )
}

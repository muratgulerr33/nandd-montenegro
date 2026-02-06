"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface TokenItem {
  name: string
  value: string
  cssVar: string
}

export function TokenGrid() {
  const [tokens, setTokens] = useState<TokenItem[]>([])

  const updateTokens = () => {
    const tokenNames = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "border",
      "input",
      "ring",
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
    ]

    const computed = getComputedStyle(document.documentElement)
    const tokenItems: TokenItem[] = tokenNames.map((name) => {
      const cssVar = `--${name}`
      const value = computed.getPropertyValue(cssVar).trim()
      return {
        name,
        value: value || "N/A",
        cssVar,
      }
    })

    setTokens(tokenItems)
  }

  useEffect(() => {
    queueMicrotask(updateTokens)

    // Dark mode değişikliklerini dinle
    const observer = new MutationObserver(() => {
      queueMicrotask(updateTokens)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token) => (
        <Card key={token.name}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-md border border-border flex-shrink-0"
                style={{ backgroundColor: `var(${token.cssVar})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">
                  {token.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {token.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


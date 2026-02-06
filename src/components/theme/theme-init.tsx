"use client"

import { useEffect } from "react"

export function ThemeInit() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("nandd-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  return null
}


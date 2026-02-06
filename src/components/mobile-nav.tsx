"use client"

import { useState, useRef, useMemo } from "react"
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Menu, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NAV_LINK_CLASS =
  "t-nav block py-3 rounded-lg hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const t = useTranslations('Nav')

  const handleLinkClick = () => {
    setOpen(false)
  }

  const handleOpenAutoFocus = (e: Event) => {
    e.preventDefault()
    requestAnimationFrame(() => firstLinkRef.current?.focus())
  }

  const navItems = useMemo(
    () => [
      { href: "/", label: t('home'), isFirst: true },
      { href: "/kurumsal", label: "Kurumsal", isFirst: false },
      { href: "/projeler", label: "Projeler", isFirst: false },
      { href: "/iletisim", label: t('contact'), isFirst: false },
    ],
    [t]
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full border border-border/60 bg-background/60 p-0 backdrop-blur hover:bg-muted/40 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        hideCloseButton
        forceMount
        className="w-[88vw] max-w-sm h-dvh flex flex-col p-0"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menü</SheetTitle>
          <SheetDescription>Sayfalara gitmek için menü</SheetDescription>
        </SheetHeader>
        {/* Header row: title + close aligned (shadcn-style) */}
        <div className="flex items-center justify-between min-h-14 h-14 px-4 border-b border-border shrink-0 pt-[env(safe-area-inset-top)]">
          <SheetTitle asChild>
            <h2 className="t-h4 leading-none text-foreground">Menü</h2>
          </SheetTitle>
          <SheetClose className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-offset-background opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none">
            <XIcon className="size-4" aria-hidden />
            <span className="sr-only">Kapat</span>
          </SheetClose>
        </div>
        {/* Scrollable Nav Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                ref={item.isFirst ? firstLinkRef : undefined}
                href={item.href}
                onClick={handleLinkClick}
                className={NAV_LINK_CLASS}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Pinned Footer with safe area */}
        <div className="mt-auto border-t border-border/60 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] px-4 flex flex-col gap-2">
          {/* Primary CTA */}
          <Button asChild className="w-full" onClick={handleLinkClick}>
            <Link href="/iletisim">{t('bookConsultation')}</Link>
          </Button>
          
          {/* Auth Buttons */}
          <Button variant="outline" className="w-full" onClick={() => {}}>
            Giriş Yap
          </Button>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            Kayıt Ol
          </Button>
          
          {/* Placeholder Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full">
                Placeholder Dropdown
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem disabled>Item 1</DropdownMenuItem>
              <DropdownMenuItem disabled>Item 2</DropdownMenuItem>
              <DropdownMenuItem disabled>Item 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  )
}

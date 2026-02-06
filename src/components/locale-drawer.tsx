"use client"

import { useRef } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const localeLabels: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
  ar: 'AR',
  ru: 'RU',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
  es: 'ES',
  pt: 'PT',
  nl: 'NL',
  sr: 'SR',
  ka: 'KA',
}

const localeData: Record<string, { label: string; short: string; flag: string }> = {
  tr: { label: 'Türkçe', short: 'TR', flag: '🇹🇷' },
  en: { label: 'English', short: 'EN', flag: '🇬🇧' },
  ar: { label: 'العربية', short: 'AR', flag: '🇸🇦' },
  ru: { label: 'Русский', short: 'RU', flag: '🇷🇺' },
  de: { label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  fr: { label: 'Français', short: 'FR', flag: '🇫🇷' },
  it: { label: 'Italiano', short: 'IT', flag: '🇮🇹' },
  es: { label: 'Español', short: 'ES', flag: '🇪🇸' },
  pt: { label: 'Português', short: 'PT', flag: '🇵🇹' },
  nl: { label: 'Nederlands', short: 'NL', flag: '🇳🇱' },
  sr: { label: 'Српски', short: 'SR', flag: '🇷🇸' },
  ka: { label: 'ქართული', short: 'KA', flag: '🇬🇪' },
}

const localeOrder = ['tr', 'en', 'ar', 'ru', 'de', 'fr', 'it', 'es', 'pt', 'nl', 'sr', 'ka']

export function LocaleDrawer() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const firstLocaleButtonRef = useRef<HTMLButtonElement>(null)

  const handleLocaleChange = (targetLocale: string) => {
    router.push(pathname, { locale: targetLocale })
  }

  const handleOpenAutoFocus = (e: Event) => {
    e.preventDefault()
    requestAnimationFrame(() => firstLocaleButtonRef.current?.focus())
  }

  const currentLabel = localeLabels[locale] || locale.toUpperCase()

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="h-11 w-11 shrink-0 rounded-full border border-border/60 bg-background/60 p-0 text-[15px] leading-none font-semibold backdrop-blur hover:bg-muted/40 lg:hidden">
          {currentLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85dvh] flex flex-col" onOpenAutoFocus={handleOpenAutoFocus}>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Dil Seçimi</DrawerTitle>
          <DrawerDescription>Sitenin dilini değiştir</DrawerDescription>
        </DrawerHeader>
        <div className="shrink-0 border-b border-border">
          <div className="flex items-center h-14 px-4">
            <h2 className="t-h4 leading-none text-foreground">Dil Seçin</h2>
          </div>
          <p className="px-4 pb-2 t-caption">Bir dil seçin</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-8 [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col gap-2">
            {localeOrder.map((loc, index) => {
              const data = localeData[loc]
              const isActive = locale === loc
              return (
                <DrawerClose key={loc} asChild>
                  <button
                    ref={index === 0 ? firstLocaleButtonRef : undefined}
                    onClick={() => handleLocaleChange(loc)}
                    className={`flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                    aria-label={data.label}
                  >
                    <span aria-hidden className="text-xl leading-none shrink-0">
                      {data.flag}
                    </span>
                    <div className="flex flex-1 flex-col gap-0">
                      <span className="t-label">{data.label}</span>
                      <span className="t-caption">{data.short}</span>
                    </div>
                  </button>
                </DrawerClose>
              )
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

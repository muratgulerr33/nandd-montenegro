"use client"

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

export function DesktopNav() {
  const t = useTranslations('Nav')

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/" className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-foreground")}>
              {t('home')}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/kurumsal" className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-foreground")}>
              Kurumsal
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/projeler" className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-foreground")}>
              Projeler
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/iletisim" className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-foreground")}>
              {t('contact')}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}


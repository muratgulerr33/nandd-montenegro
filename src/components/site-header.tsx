import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { NanddLogo } from '@/components/brand/nandd-logo';
import { LocaleSwitcher } from './locale-switcher';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';
import { LocaleDrawer } from './locale-drawer';
import { ThemeSwitch } from './theme/theme-switch';

export async function SiteHeader() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border/60">
      <div className="container mx-auto flex min-h-[56px] items-center justify-between gap-2 px-4 py-2">
        {/* Brand - Sol */}
        <Link href="/" className="flex items-center shrink-0 py-1 tactile">
          <NanddLogo />
        </Link>

        {/* Desktop Navigation - Ortada (lg ve üstü) */}
        <div className="hidden lg:flex flex-1 min-w-0 justify-center">
          <DesktopNav />
        </div>

        {/* Desktop Right Section (lg ve üstü) */}
        <div className="hidden lg:flex shrink-0 items-center gap-2">
          <ThemeSwitch />
          <Button asChild size="sm">
            <Link href="/iletisim">{t('bookConsultation')}</Link>
          </Button>
          <LocaleSwitcher />
        </div>

        {/* Mobile Section (lg altı) */}
        <div className="flex shrink-0 lg:hidden items-center gap-2">
          <ThemeSwitch />
          <LocaleDrawer />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

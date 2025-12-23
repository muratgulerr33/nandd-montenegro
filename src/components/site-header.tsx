import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';

export async function SiteHeader() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display text-xl font-semibold text-foreground">N-AND-D Construction</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('home')}
          </Link>
          <Link href="/kurumsal" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Kurumsal
          </Link>
          <Link href="/projeler" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Projeler
          </Link>
          <Link href="/iletisim" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {t('contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/iletisim">{t('bookConsultation')}</Link>
          </Button>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}

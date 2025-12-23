import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const t = await getTranslations('Nav');
  const tFooter = await getTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold">N-AND-D Construction</h3>
            <p className="text-sm text-muted-foreground">
              {tFooter('description')}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{tFooter('quickLinks')}</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                {t('home')}
              </Link>
              <Link href="/kurumsal" className="text-sm text-muted-foreground hover:text-primary">
                Kurumsal
              </Link>
              <Link href="/projeler" className="text-sm text-muted-foreground hover:text-primary">
                Projeler
              </Link>
              <Link href="/iletisim" className="text-sm text-muted-foreground hover:text-primary">
                {t('contact')}
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {year} N-AND-D Construction. {tFooter('rights')}
        </div>
      </div>
    </footer>
  );
}

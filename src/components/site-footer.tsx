import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Clock, Users, FileCheck, Target } from 'lucide-react';
import { IconPhoneFilled, IconWhatsApp, IconTelegram } from '@/components/icons/brand';
import { NanddLogo } from '@/components/brand/nandd-logo';
import { Button } from '@/components/ui/button';
import { FooterNav } from '@/components/footer-nav';
import { cn } from '@/lib/utils';

export async function SiteFooter() {
  const t = await getTranslations('Footer');

  return (
    <footer
      className={cn(
        'border-t border-border/60',
        'pb-8',
        'max-sm:pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]'
      )}
      role="contentinfo"
    >
      {/* A) Pre-Footer CTA Strip — bg-surface-1 */}
      <section
        className="bg-surface-1 border-b border-border/60"
        aria-labelledby="footer-cta-title"
      >
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="space-y-1">
              <h2 id="footer-cta-title" className="t-h5 text-foreground">
                {t('ctaTitle')}
              </h2>
              <p className="t-muted max-w-md">{t('ctaSubtitle')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild variant="default" size="lg" className="min-h-[44px] min-w-[44px]">
                <Link href="/iletisim">{t('ctaPrimary')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-[44px] min-w-[44px]">
                <Link href="/iletisim">{t('ctaSecondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* B) Main Footer — bg-surface-2 */}
      <section className="bg-surface-2">
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {/* Brand block */}
            <div className="space-y-4 lg:col-span-5">
              <Link
                href="/"
                className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded tactile"
                aria-label="N-AND-D Construction"
              >
                <NanddLogo />
              </Link>
              <p className="t-muted max-w-sm">{t('brandBlurb')}</p>
              {/* Trust chips */}
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'trustChip1', Icon: Users },
                  { key: 'trustChip2', Icon: FileCheck },
                  { key: 'trustChip3', Icon: Target },
                ].map(({ key, Icon }) => (
                  <span
                    key={key}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md border border-border/60 bg-surface-1 px-3 py-2',
                      't-small text-muted-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-4">
              <FooterNav />
            </div>

            {/* Contact — sosyal ikonlar (telefon, WhatsApp, Telegram) + çalışma saatleri */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="t-h6 text-foreground">{t('contactHeading')}</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    href="/iletisim"
                    aria-label={t('contactPhone')}
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground tactile tactile-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    )}
                  >
                    <IconPhoneFilled className="size-5" aria-hidden />
                  </Link>
                  <Link
                    href="/iletisim"
                    aria-label={t('contactWhatsApp')}
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground tactile tactile-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    )}
                  >
                    <IconWhatsApp className="size-5" aria-hidden />
                  </Link>
                  <Link
                    href="/iletisim"
                    aria-label={t('contactTelegram')}
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground tactile tactile-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    )}
                  >
                    <IconTelegram className="size-5" aria-hidden />
                  </Link>
                </div>
                <p className="t-muted flex items-center gap-2">
                  <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{t('workingHours')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

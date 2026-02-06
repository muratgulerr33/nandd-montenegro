import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

const PROJECT_01_IMAGE = '/images/projects/project-01/project-01-exterior.webp';
const PROJECT_02_IMAGE = '/images/projects/project-02/project-02-exterior.webp';

export default async function ProjelerPage() {
  const t = await getTranslations('Projeler');

  return (
    <div className="bg-background text-foreground">
      <section
        className="w-full px-6 py-16 md:py-24 bg-background"
        aria-labelledby="projeler-heading"
      >
        <div className="max-w-5xl mx-auto">
          <h1 id="projeler-heading" className="t-h1 text-center text-foreground">
            {t('heading')}
          </h1>
          <p className="t-body text-muted-foreground text-center max-w-2xl mx-auto mt-4">
            {t('lead')}
          </p>
        </div>
      </section>

      <section
        className="w-full px-6 py-16 md:py-24 bg-surface-1"
        aria-label={t('ariaLabel')}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="flex flex-col rounded-lg border border-border overflow-hidden bg-card">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <Image
                  src={PROJECT_01_IMAGE}
                  alt={t('items.0.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-2">
                <p className="t-small text-muted-foreground uppercase tracking-wide">
                  {t('items.0.tag')}
                </p>
                <h2 className="t-h4 text-foreground">{t('items.0.title')}</h2>
                <p className="t-muted text-muted-foreground">
                  {t('items.0.description')}
                </p>
                <Button
                  asChild
                  variant="default"
                  size="default"
                  className="mt-2 w-fit rounded-full px-6 h-10"
                >
                  <Link href="/projeler/seafield-residences">{t('items.0.cta')}</Link>
                </Button>
              </div>
            </article>

            <article className="flex flex-col rounded-lg border border-border overflow-hidden bg-card">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <Image
                  src={PROJECT_02_IMAGE}
                  alt={t('items.1.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-2">
                <p className="t-small text-muted-foreground uppercase tracking-wide">
                  {t('items.1.tag')}
                </p>
                <h2 className="t-h4 text-foreground">{t('items.1.title')}</h2>
                <p className="t-muted text-muted-foreground">
                  {t('items.1.description')}
                </p>
                <Button
                  asChild
                  variant="default"
                  size="default"
                  className="mt-2 w-fit rounded-full px-6 h-10"
                >
                  <Link href="/projeler/asis-adriatic">{t('items.1.cta')}</Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

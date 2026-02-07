import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

const HERO_DESKTOP = '/images/home/hero/hero-montenegro-exterior-01_16x9.webp';
const HERO_MOBILE = '/images/home/hero/hero-montenegro-exterior-01_4x5.webp';

export default async function HomePage() {
  const t = await getTranslations('home');
  return (
    <div className="bg-background text-foreground">
      {/* SECTION 1 — Hero (full-bleed background) */}
      <section
        className="relative w-full min-h-[92vh] md:min-h-[85vh] overflow-hidden"
        aria-label="Hero"
      >
        {/* Background images — art-direction: mobile 4:5, desktop 16:9 */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={HERO_MOBILE}
            alt={t('hero.imageAlt')}
            fill
            className="object-cover md:hidden"
            priority
            sizes="100vw"
          />
          <Image
            src={HERO_DESKTOP}
            alt={t('hero.imageAlt')}
            fill
            className="object-cover hidden md:block"
            priority
            sizes="100vw"
          />
        </div>
        {/* Base overlay: theme-independent, top light → bottom darker (readability) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80"
          aria-hidden
        />
        {/* Vignette: center lighter, corners slightly darker (token in globals) */}
        <div className="absolute inset-0 hero-vignette" aria-hidden />
        {/* Content — safe zone, left-aligned; hero text tokens in globals */}
        <div className="relative z-10 flex flex-col items-start justify-center min-h-[92vh] md:min-h-[85vh] px-6 pt-20 md:pt-24 pb-16 md:pb-24">
          <div className="max-w-2xl">
            <p className="t-kicker hero-text-muted mb-4">
              {t('hero.kicker')}
            </p>
            <h1 className="t-display hero-text text-left max-w-4xl mb-6">
              {t('hero.title.line1')}
              <br />
              {t('hero.title.line2')}
            </h1>
            <p className="t-lead hero-text-muted-75 text-left max-w-2xl mb-10">
              {t('hero.lead')}
            </p>
            <Button asChild size="lg">
              <a href="#projects">{t('hero.cta')}</a>
            </Button>
          </div>
        </div>
        {/* Scroll cue — minimal (token in globals) */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-px h-8 hero-scroll-cue rounded-full"
          aria-hidden
        />
      </section>

      {/* SECTION 2 — Manifesto */}
      <section className="w-full px-6 py-16 md:py-24 bg-background" aria-labelledby="manifesto-heading">
        <div className="max-w-3xl mx-auto">
          <h2 id="manifesto-heading" className="t-h2 text-center">
            {t('manifesto.heading')}
          </h2>
          <div className="mt-8 space-y-4">
            <p className="t-body text-muted-foreground text-center">
              {t('manifesto.lead')}
            </p>
            <ul className="space-y-3 list-none pl-0">
              <li className="t-body text-foreground flex gap-3">
                <span className="text-muted-foreground shrink-0">—</span>
                <span>{t('manifesto.bullets.0')}</span>
              </li>
              <li className="t-body text-foreground flex gap-3">
                <span className="text-muted-foreground shrink-0">—</span>
                <span>{t('manifesto.bullets.1')}</span>
              </li>
              <li className="t-body text-foreground flex gap-3">
                <span className="text-muted-foreground shrink-0">—</span>
                <span>{t('manifesto.bullets.2')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Projects */}
      <section
        id="projects"
        className="w-full px-6 py-16 md:py-24 bg-surface-1"
        aria-labelledby="projects-heading"
      >
        <div className="max-w-5xl mx-auto">
          <h2 id="projects-heading" className="t-h2 text-center">
            {t('projects.heading')}
          </h2>
          <p className="t-body text-muted-foreground text-center max-w-2xl mx-auto mt-4">
            {t('projects.lead')}
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="flex flex-col rounded-lg border border-border overflow-hidden bg-card">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <Image
                  src="/images/projects/project-01/project-01-exterior.webp"
                  alt={t('projects.items.0.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-2">
                <p className="t-small text-muted-foreground uppercase tracking-wide">{t('projects.items.0.tag')}</p>
                <h3 className="t-h4">{t('projects.items.0.title')}</h3>
                <p className="t-muted">{t('projects.items.0.description')}</p>
                <Button asChild variant="secondary" size="default" className="mt-2 w-fit rounded-full px-6 h-10">
                  <Link href="/projeler/seafield-residences">{t('projects.items.0.cta')}</Link>
                </Button>
              </div>
            </article>
            <article className="flex flex-col rounded-lg border border-border overflow-hidden bg-card">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                <Image
                  src="/images/projects/project-02/project-02-exterior.webp"
                  alt={t('projects.items.1.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 space-y-2">
                <p className="t-small text-muted-foreground uppercase tracking-wide">{t('projects.items.1.tag')}</p>
                <h3 className="t-h4">{t('projects.items.1.title')}</h3>
                <p className="t-muted">{t('projects.items.1.description')}</p>
                <Button asChild variant="secondary" size="default" className="mt-2 w-fit rounded-full px-6 h-10">
                  <Link href="/projeler/asis-adriatic">{t('projects.items.1.cta')}</Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Interiors (4:3 — Bedroom, Bathroom, Living) */}
      <section className="w-full px-6 py-16 md:py-24 bg-background" aria-labelledby="interiors-heading">
        <div className="max-w-5xl mx-auto">
          <h2 id="interiors-heading" className="t-h2 text-center">
            {t('interiors.heading')}
          </h2>
          <div className="mt-8 space-y-6">
            <p className="t-body text-muted-foreground text-center max-w-2xl mx-auto">
              {t('interiors.lead')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted/50">
                <Image
                  src="/images/home/interiors/interior-bedroom.webp"
                  alt={t('interiors.items.0.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
              </div>
              <div className="relative aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted/50">
                <Image
                  src="/images/home/interiors/interior-bathroom.webp"
                  alt={t('interiors.items.1.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
              </div>
              <div className="relative aspect-[4/3] rounded-lg border border-border overflow-hidden bg-muted/50">
                <Image
                  src="/images/home/interiors/interior-living.webp"
                  alt={t('interiors.items.2.imageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Investment */}
      <section className="w-full px-6 py-16 md:py-24 bg-surface-1" aria-labelledby="investment-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="investment-heading" className="t-h2 text-center">
            {t('investment.heading')}
          </h2>
          <div className="mt-8 space-y-6">
            <p className="t-body text-muted-foreground text-center max-w-2xl mx-auto">
              {t('investment.lead')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card text-center space-y-2">
              <h4 className="t-h5 text-foreground">{t('investment.cards.0.title')}</h4>
              <p className="t-small text-muted-foreground">{t('investment.cards.0.description')}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-center space-y-2">
              <h4 className="t-h5 text-foreground">{t('investment.cards.1.title')}</h4>
              <p className="t-small text-muted-foreground">{t('investment.cards.1.description')}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-center space-y-2">
              <h4 className="t-h5 text-foreground">{t('investment.cards.2.title')}</h4>
              <p className="t-small text-muted-foreground">{t('investment.cards.2.description')}</p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Final CTA */}
      <section className="w-full px-6 py-16 md:py-24 bg-background" aria-label="Son çağrı">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="t-h2">
            {t('finalCta.heading')}
          </h2>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/projeler">{t('finalCta.cta')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

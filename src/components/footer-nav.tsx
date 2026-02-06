'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const linkClass = cn(
  't-nav text-muted-foreground hover:text-foreground hover:underline tactile',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded'
);

export function FooterNav() {
  const t = useTranslations('Footer');

  const companyLinks = [
    { href: '/', label: t('navHome') },
    { href: '/kurumsal', label: t('navWhoWeAre') },
  ];
  const projectLinks = [
    { href: '/projeler', label: t('navProjectsLink') },
    { href: '/iletisim', label: t('navConsultation') },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div>
        <h3 className="t-h6 text-foreground mb-3">{t('navCompany')}</h3>
        <ul className="flex flex-col gap-2">
          {companyLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={linkClass}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="t-h6 text-foreground mb-3">{t('navProjects')}</h3>
        <ul className="flex flex-col gap-2">
          {projectLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={linkClass}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

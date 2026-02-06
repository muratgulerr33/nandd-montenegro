import { getContent } from '@/content/nandd';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/contact-form';

export default async function IletisimPage() {
  const t = await getTranslations('Iletisim');
  const content = getContent('tr').iletisim;

  const rawForm = content.content.forms[0];
  const placeholderKeys = [
    'placeholderAd',
    'placeholderSoyad',
    'placeholderNumara',
    'placeholderEmail',
    'placeholderMesaj',
  ] as const;
  const visibleFields = rawForm
    ? rawForm.fields
        .filter((f) => f.type !== 'hidden')
        .map((f, i) => {
          const key = placeholderKeys[i];
          return {
            ...f,
            placeholder: key != null ? t(`form.${key}`) : (f.placeholder ?? ''),
            asTextarea: i === 4,
          };
        })
    : [];

  return (
    <div className="bg-background text-foreground">
      <section
        className="w-full px-6 py-16 md:py-24 bg-background"
        aria-labelledby="iletisim-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 id="iletisim-heading" className="t-h1 text-foreground">
            {t('heading')}
          </h1>
          <p className="t-lead text-muted-foreground mt-4">{t('subHeading')}</p>
        </div>
      </section>

      <section
        className="w-full px-6 py-16 md:py-24 bg-surface-1"
        aria-label={t('ariaLabel')}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="t-body text-muted-foreground">{t('paragraph')}</p>

          {visibleFields.length > 0 && (
            <ContactForm
              fields={visibleFields}
              formTitle={t('form.title')}
              submitLabel={t('form.submit')}
            />
          )}
        </div>
      </section>
    </div>
  );
}

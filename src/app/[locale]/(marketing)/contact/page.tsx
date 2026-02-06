import { getContent } from '@/content/nandd';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/contact-form';

export default async function ContactPage() {
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
        .map((f, i) => ({
          ...f,
          placeholder: t(`form.${placeholderKeys[i]}`),
          asTextarea: i === 4,
        }))
    : [];

  return (
    <div className="bg-background text-foreground space-y-12">
      <div className="text-center space-y-4">
        <h1 className="t-h1">{t('heading')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subHeading')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-muted-foreground t-body">{t('paragraph')}</p>

        {visibleFields.length > 0 && (
          <ContactForm
            fields={visibleFields}
            formTitle={t('form.title')}
            submitLabel={t('form.submit')}
          />
        )}
      </div>
    </div>
  );
}

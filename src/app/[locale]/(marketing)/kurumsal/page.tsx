import { getTranslations } from 'next-intl/server';

export default async function KurumsalPage() {
  const t = await getTranslations('Kurumsal');

  return (
    <div className="bg-background text-foreground">
      <section
        className="w-full px-6 py-16 md:py-24 bg-background"
        aria-labelledby="kurumsal-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 id="kurumsal-heading" className="t-h1 text-foreground">
            {t('pageTitle')}
          </h1>
          <p className="t-lead text-muted-foreground mt-4">
            {t('pageLead')}
          </p>
        </div>
      </section>

      <section
        className="w-full px-6 py-16 md:py-24 bg-surface-1"
        aria-labelledby="biz-kimiz-heading"
      >
        <div className="max-w-3xl mx-auto">
          <div className="p-6 md:p-8 rounded-lg border border-border bg-card space-y-4">
            <h2 id="biz-kimiz-heading" className="t-h3 text-foreground">
              {t('headings.bizKimiz')}
            </h2>
            <p className="t-body text-muted-foreground">
              {t('paragraphs.bizKimiz')}
            </p>
          </div>
        </div>
      </section>

      <section
        className="w-full px-6 py-16 md:py-24 bg-background"
        aria-labelledby="misyon-heading vizyon-heading"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 md:p-8 rounded-lg border border-border bg-card space-y-4">
            <h3 id="misyon-heading" className="t-h4 text-foreground">
              {t('headings.misyonumuz')}
            </h3>
            <p className="t-body text-muted-foreground">
              {t('paragraphs.misyon')}
            </p>
          </div>
          <div className="p-6 md:p-8 rounded-lg border border-border bg-card space-y-4">
            <h3 id="vizyon-heading" className="t-h4 text-foreground">
              {t('headings.vizyonumuz')}
            </h3>
            <p className="t-body text-muted-foreground">
              {t('paragraphs.vizyon')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

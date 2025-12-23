import { getTranslations } from 'next-intl/server';

export default async function ProcessPage() {
  const t = await getTranslations('Pages.process');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
    </div>
  );
}


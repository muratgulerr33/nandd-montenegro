import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export default async function AsisPage() {
  const t = await getTranslations('Projeler.asis');
  const content = getContent('tr').asis;

  const galeriImages = content.content.images.filter(
    (img) =>
      !img.src.includes('LOGO') &&
      !img.src.includes('nd-2') &&
      !img.src.includes('NANDD-YENI-LOFO')
  );

  return (
    <div className="space-y-12">
      <h1 className="t-h1">{t('pageTitle')}</h1>

      {galeriImages.length > 0 && (
        <section className="space-y-6">
          <h2 className="t-h2">{t('galeriHeading')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeriImages.map((img, idx) => (
              <div key={idx} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={toAbsoluteImageUrl(img.src)}
                  alt={img.alt || `${t('imageAltFallback')} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

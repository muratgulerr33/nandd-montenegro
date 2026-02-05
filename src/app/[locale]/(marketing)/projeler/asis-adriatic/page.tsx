import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import Image from 'next/image';

export default async function AsisPage() {
  const content = getContent('tr').asis;
  const galeriHeading = content.content.headings.find((h) => h.text === 'GALERİ');
  
  // Title'dan "Asis Adriatic" çıkar (string split ile "–" öncesi)
  const title = content.title.split('–')[0].trim();
  
  // Galeri için görselleri filtrele (logo ve header görsellerini hariç tut)
  const galeriImages = content.content.images.filter((img) => 
    !img.src.includes('LOGO') && 
    !img.src.includes('nd-2') && 
    !img.src.includes('NANDD-YENI-LOFO')
  );

  return (
    <div className="space-y-12">
      <h1 className="t-h1">
        {title}
      </h1>

      {/* Galeri */}
      {galeriHeading && galeriImages.length > 0 && (
        <section className="space-y-6">
          <h2 className="t-h2">
            {galeriHeading.text}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeriImages.map((img, idx) => (
              <div key={idx} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={toAbsoluteImageUrl(img.src)}
                  alt={img.alt || `Asis Adriatic ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* İçerik azsa sadece heading göster */}
      {content.content.headings.length > 1 && (
        <section className="space-y-4">
          {content.content.headings
            .filter((h) => h.text !== 'GALERİ')
            .map((heading, idx) => (
              <div key={idx}>
                {heading.level === 'h2' && (
                  <h2 className="t-h2">{heading.text}</h2>
                )}
                {heading.level === 'h3' && (
                  <h3 className="t-h3">{heading.text}</h3>
                )}
              </div>
            ))}
        </section>
      )}
    </div>
  );
}


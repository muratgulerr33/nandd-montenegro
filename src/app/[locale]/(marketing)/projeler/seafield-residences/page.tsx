import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import Image from 'next/image';

export default async function SeafieldPage() {
  const content = getContent('tr').seafield;
  const aboutHeading = content.content.headings.find((h) => h.text.toLowerCase().includes('about'));
  const nedenHeading = content.content.headings.find((h) => h.text.includes('Neden Seafeild'));
  const nedenText = content.content.headings.find((h) => h.text.includes('Seafeild Residence, Montenegro'));
  const galeriHeading = content.content.headings.find((h) => h.text === 'GALERİ');
  
  // Galeri için görselleri filtrele (logo ve header görsellerini hariç tut)
  const galeriImages = content.content.images.filter((img) => 
    !img.src.includes('LOGO') && 
    !img.src.includes('nd-2') && 
    !img.src.includes('NANDD-YENI-LOFO')
  );

  return (
    <div className="space-y-12">
      <h1 className="t-h1">
        Seafield Residences
      </h1>

      {/* About Section */}
      {aboutHeading && (
        <section className="space-y-4">
          <h2 className="t-h2">
            {aboutHeading.text}
          </h2>
          {content.content.paragraphs.slice(0, 2).map((para, idx) => (
            <p key={idx} className="t-body text-muted-foreground">
              {para}
            </p>
          ))}
        </section>
      )}

      {/* Neden Seafeild Residence? */}
      {nedenHeading && (
        <section className="space-y-4">
          <h2 className="t-h2">
            {nedenHeading.text}
          </h2>
          {nedenText && (
            <p className="t-body text-muted-foreground max-w-3xl">
              {nedenText.text}
            </p>
          )}
        </section>
      )}

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
                  alt={img.alt || `Seafield Residences ${idx + 1}`}
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


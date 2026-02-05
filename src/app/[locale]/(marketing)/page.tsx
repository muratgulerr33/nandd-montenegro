import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import { ContactForm } from '@/components/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default async function HomePage() {
  const content = getContent('tr').home;
  const seafield = getContent('tr').seafield;
  const asis = getContent('tr').asis;
  
  const heroHeading = content.content.headings[0]?.text || '';
  // JSON'da zaten doğru boşluk var, regex'e gerek yok
  const formattedHeroHeading = heroHeading;
  
  // Punctuation spacing düzeltmesi
  const normalizeText = (text: string) => {
    // Nokta sonrası boşluk ekle
    const normalized = text.replace(/\.([A-ZÇĞİÖŞÜ])/g, '. $1');
    return normalized;
  };
  
  const subtitle = normalizeText(content.content.paragraphs[0] || '');
  const nedenMontenegroHeading = content.content.headings.find((h) => h.text === 'Neden Montenegro?');
  const nedenMontenegroParagraphs = content.content.paragraphs.slice(1, 3); // İlk 2 paragraf "Neden Montenegro?" için
  
  const contactHeading = content.content.headings.find((h) => h.text.includes('iletişime'));
  const formattedContactHeading = contactHeading ? normalizeText(contactHeading.text) : 'İletişim';
  
  // Proje görselleri
  const seafieldImage = seafield.content.images.find(img => 
    img.src.includes('IMG_9748') || img.src.includes('2.png') || img.src.includes('3.png') || img.src.includes('4.png')
  );
  const asisImage = asis.content.images.find(img => 
    img.src && !img.src.includes('logo') && !img.src.includes('NANDD')
  );

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 md:py-16">
        <h1 className="t-display">
          {formattedHeroHeading}
        </h1>
        <p className="t-lead text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </section>

      <Separator />

      {/* Neden Montenegro? */}
      {nedenMontenegroHeading && (
        <section className="space-y-6 py-12 md:py-16">
          <h2 className="t-h2 text-center">
            {nedenMontenegroHeading.text}
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {nedenMontenegroParagraphs.map((para, idx) => (
              <p key={idx} className="t-body text-muted-foreground">
                {normalizeText(para)}
              </p>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Projeler Highlight */}
      <section className="space-y-8 py-12 md:py-16">
        <h2 className="t-h2 text-center">Projelerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/60">
            {seafieldImage && (
              <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={toAbsoluteImageUrl(seafieldImage.src)}
                  alt={seafieldImage.alt || 'Seafield Residences'}
                  fill
                  className="object-cover rounded-md border border-border/40"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Residence</Badge>
              </div>
              <CardTitle className="t-h4">Seafield Residences</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="t-muted">
                Montenegro&apos;nun Bar şehrinde, muhteşem Adriyatik denizi manzarasıyla öne çıkan prestijli bir konut projesi.
              </CardDescription>
              <Button asChild variant="link" className="px-0 mt-4">
                <Link href="/projeler/seafield-residences">Detayları Gör →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            {asisImage && (
              <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={toAbsoluteImageUrl(asisImage.src)}
                  alt={asisImage.alt || 'Asis Adriatic'}
                  fill
                  className="object-cover rounded-md border border-border/40"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Investment</Badge>
              </div>
              <CardTitle className="t-h4">Asis Adriatic</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="t-muted">
                Modern tasarımı ve denize yakınlığı ile ideal bir yaşam alanı.
              </CardDescription>
              <Button asChild variant="link" className="px-0 mt-4">
                <Link href="/projeler/asis-adriatic">Detayları Gör →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Contact CTA Section */}
      <section className="space-y-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="t-h3 text-center">
            {formattedContactHeading}
          </h3>
          <Separator className="max-w-md mx-auto" />
        </div>
        {content.content.forms[0] && (
          <div className="max-w-2xl mx-auto">
            <ContactForm fields={content.content.forms[0].fields} />
          </div>
        )}
      </section>
    </div>
  );
}

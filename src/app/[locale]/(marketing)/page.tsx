import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import { ContactForm } from '@/components/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default async function HomePage() {
  const content = getContent('tr').home;
  const heroHeading = content.content.headings[0]?.text || '';
  // "HAYALLERİNİZBurada!" -> "HAYALLERİNİZ Burada!" (whitespace düzeltmesi)
  const formattedHeroHeading = heroHeading.replace(/([A-Z])([A-Z])/g, '$1 $2');
  const subtitle = content.content.paragraphs[0] || '';
  const nedenMontenegroHeading = content.content.headings.find((h) => h.text === 'Neden Montenegro?');
  const nedenMontenegroParagraphs = content.content.paragraphs.slice(1, 3); // İlk 2 paragraf "Neden Montenegro?" için

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          {formattedHeroHeading}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </section>

      {/* Neden Montenegro? */}
      {nedenMontenegroHeading && (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-bold text-center">
            {nedenMontenegroHeading.text}
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {nedenMontenegroParagraphs.map((para, idx) => (
              <p key={idx} className="text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Projeler Highlight */}
      <section className="space-y-8">
        <h2 className="font-display text-3xl font-bold text-center">Projelerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seafield Residences</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Montenegro'nun Bar şehrinde, muhteşem Adriyatik denizi manzarasıyla öne çıkan prestijli bir konut projesi.
              </CardDescription>
              <Link href="/projeler/seafield-residences" className="mt-4 inline-block">
                <span className="text-primary hover:underline">Detayları Gör →</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asis Adriatic</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Modern tasarımı ve denize yakınlığı ile ideal bir yaşam alanı.
              </CardDescription>
              <Link href="/projeler/asis-adriatic" className="mt-4 inline-block">
                <span className="text-primary hover:underline">Detayları Gör →</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="space-y-6">
        <h3 className="font-display text-2xl font-bold text-center">
          {content.content.headings.find((h) => h.text.includes('iletişime'))?.text || 'İletişim'}
        </h3>
        {content.content.forms[0] && (
          <div className="max-w-2xl mx-auto">
            <ContactForm fields={content.content.forms[0].fields} />
          </div>
        )}
      </section>
    </div>
  );
}

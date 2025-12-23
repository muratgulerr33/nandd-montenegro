import { getContent, toAbsoluteImageUrl } from '@/content/nandd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default async function ProjelerPage() {
  const seafield = getContent('tr').seafield;
  const asis = getContent('tr').asis;

  // Proje görselleri
  const seafieldImage = seafield.content.images.find(img => 
    img.src.includes('IMG_9748') || img.src.includes('2.png') || img.src.includes('3.png') || img.src.includes('4.png')
  );
  const asisImage = asis.content.images.find(img => 
    img.src && !img.src.includes('logo') && !img.src.includes('NANDD')
  );

  return (
    <div className="bg-background text-foreground space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Projelerimiz
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Montenegro'da hayalinizdeki yaşamı keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seafield Residences */}
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
            <CardTitle className="font-medium">Seafield Residences</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-muted-foreground">
              Montenegro'nun Bar şehrinde, muhteşem Adriyatik denizi manzarasıyla öne çıkan prestijli bir konut projesi.
            </CardDescription>
            <Button asChild variant="link" className="px-0 mt-4">
              <Link href="/projeler/seafield-residences">Detayları Gör →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Asis Adriatic */}
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
            <CardTitle className="font-medium">Asis Adriatic</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-muted-foreground">
              Modern tasarımı ve denize yakınlığı ile ideal bir yaşam alanı.
            </CardDescription>
            <Button asChild variant="link" className="px-0 mt-4">
              <Link href="/projeler/asis-adriatic">Detayları Gör →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


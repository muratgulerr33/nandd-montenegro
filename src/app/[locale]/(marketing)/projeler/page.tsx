import { getContent } from '@/content/nandd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

export default async function ProjelerPage() {
  const seafield = getContent('tr').seafield;
  const asis = getContent('tr').asis;

  return (
    <div className="space-y-12">
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

        {/* Asis Adriatic */}
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
    </div>
  );
}


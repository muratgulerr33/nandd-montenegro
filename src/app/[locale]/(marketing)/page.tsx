import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const tCta = await getTranslations('Cta');

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/contact">{tCta('bookConsultation')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{tCta('exploreServices')}</Link>
          </Button>
        </div>
      </section>

      {/* Value Props */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('valueProps.property.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('valueProps.property.desc')}</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('valueProps.legal.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('valueProps.legal.desc')}</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('valueProps.turnkey.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{t('valueProps.turnkey.desc')}</CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="font-display text-3xl font-bold text-center">
          {t('howItWorks.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 text-center">
            <Badge variant="default" className="text-lg px-4 py-2">
              1
            </Badge>
            <h3 className="font-semibold text-lg">{t('howItWorks.step1.title')}</h3>
            <p className="text-muted-foreground">{t('howItWorks.step1.desc')}</p>
          </div>
          
          <div className="space-y-4 text-center">
            <Badge variant="default" className="text-lg px-4 py-2">
              2
            </Badge>
            <h3 className="font-semibold text-lg">{t('howItWorks.step2.title')}</h3>
            <p className="text-muted-foreground">{t('howItWorks.step2.desc')}</p>
          </div>
          
          <div className="space-y-4 text-center">
            <Badge variant="default" className="text-lg px-4 py-2">
              3
            </Badge>
            <h3 className="font-semibold text-lg">{t('howItWorks.step3.title')}</h3>
            <p className="text-muted-foreground">{t('howItWorks.step3.desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

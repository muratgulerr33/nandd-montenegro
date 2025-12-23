import { getContent } from '@/content/nandd';

export default async function KurumsalPage() {
  const content = getContent('tr').kurumsal;
  const bizKimizHeading = content.content.headings.find((h) => h.text.includes('BİZ KİMİZ') || h.text.includes('Biz kimiz'));
  const misyonHeading = content.content.headings.find((h) => h.text.toLowerCase().includes('misyon'));
  const vizyonHeading = content.content.headings.find((h) => h.text.toLowerCase().includes('vizyon'));

  // Paragrafları böl: ilk paragraf "Biz kimiz?", sonraki misyon, sonraki vizyon
  const paragraphs = content.content.paragraphs;
  const bizKimizText = paragraphs[0] || '';
  const misyonText = paragraphs[1] || '';
  const vizyonText = paragraphs[2] || '';

  return (
    <div className="space-y-12">
      {/* Biz Kimiz? */}
      {bizKimizHeading && (
        <section className="space-y-6">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {bizKimizHeading.text}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {bizKimizText}
          </p>
        </section>
      )}

      {/* Misyon */}
      {misyonHeading && (
        <section className="space-y-4">
          <h2 className="font-display text-3xl font-bold">
            {misyonHeading.text}
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            {misyonText}
          </p>
        </section>
      )}

      {/* Vizyon */}
      {vizyonHeading && (
        <section className="space-y-4">
          <h2 className="font-display text-3xl font-bold">
            {vizyonHeading.text}
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            {vizyonText}
          </p>
        </section>
      )}
    </div>
  );
}


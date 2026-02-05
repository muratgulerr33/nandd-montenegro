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
          <h1 className="t-h1">
            {bizKimizHeading.text}
          </h1>
          <p className="t-lead text-muted-foreground max-w-3xl">
            {bizKimizText}
          </p>
        </section>
      )}

      {/* Misyon */}
      {misyonHeading && (
        <section className="space-y-4">
          <h2 className="t-h2">
            {misyonHeading.text}
          </h2>
          <p className="t-body text-muted-foreground max-w-3xl">
            {misyonText}
          </p>
        </section>
      )}

      {/* Vizyon */}
      {vizyonHeading && (
        <section className="space-y-4">
          <h2 className="t-h2">
            {vizyonHeading.text}
          </h2>
          <p className="t-body text-muted-foreground max-w-3xl">
            {vizyonText}
          </p>
        </section>
      )}
    </div>
  );
}


import { getContent } from '@/content/nandd';
import { ContactForm } from '@/components/contact-form';

export default async function IletisimPage() {
  const content = getContent('tr').iletisim;
  const mainHeading = content.content.headings.find((h) => h.text === 'İletişim');
  const subHeading = content.content.headings.find((h) => h.text.includes('iletişime geçmek'));
  const mainParagraph = content.content.paragraphs[0] || '';

  return (
    <div className="space-y-12">
      {mainHeading && (
        <div className="text-center space-y-4">
          <h1 className="t-h1">
            {mainHeading.text}
          </h1>
          {subHeading && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subHeading.text}
            </p>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-muted-foreground">
          {mainParagraph}
        </p>

        {content.content.forms[0] && (
          <ContactForm fields={content.content.forms[0].fields} />
        )}
      </div>
    </div>
  );
}


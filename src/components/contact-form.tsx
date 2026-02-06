'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type FormField = {
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
  asTextarea?: boolean;
};

type ContactFormProps = {
  fields: FormField[];
  formTitle?: string;
  submitLabel?: string;
};

export function ContactForm({
  fields,
  formTitle = 'Contact form',
  submitLabel = 'Send',
}: ContactFormProps) {
  const visibleFields = fields.filter((field) => field.type !== 'hidden');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted (UI only)');
  };

  return (
    <Card className="border-border bg-card rounded-lg">
      <CardHeader>
        <CardTitle className="t-h3 text-foreground">{formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {visibleFields.map((field, index) => {
            if (field.type === 'email') {
              return (
                <div key={index}>
                  <Input
                    type="email"
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full"
                    aria-label={field.placeholder}
                  />
                </div>
              );
            }

            if (field.asTextarea) {
              return (
                <div key={index}>
                  <Textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full min-h-24"
                    aria-label={field.placeholder}
                  />
                </div>
              );
            }

            return (
              <div key={index}>
                <Input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full"
                  aria-label={field.placeholder}
                />
              </div>
            );
          })}
          <Button type="submit" className="w-full" variant="default">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
};

type ContactFormProps = {
  fields: FormField[];
};

export function ContactForm({ fields }: ContactFormProps) {
  // Sadece görünür alanları filtrele (hidden alanları hariç tut)
  const visibleFields = fields.filter((field) => field.type !== 'hidden');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Şimdilik noop - UI only
    console.log('Form submitted (UI only)');
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-display">İletişim Formu</CardTitle>
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
                  />
                </div>
              );
            }

            if (field.type === 'text' && field.placeholder.toLowerCase().includes('mesaj')) {
              return (
                <div key={index}>
                  <Textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full min-h-24"
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
                />
              </div>
            );
          })}
          <Button type="submit" className="w-full" variant="default">
            Gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


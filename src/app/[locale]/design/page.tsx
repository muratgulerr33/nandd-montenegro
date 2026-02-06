import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "tr" }];
}

export default async function DesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  redirect(`/${locale}/styleguide`);
}

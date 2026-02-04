import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DesignClient } from "./_components/design-client";

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

  if (locale !== "tr") {
    notFound();
  }

  setRequestLocale(locale);

  return <DesignClient />;
}

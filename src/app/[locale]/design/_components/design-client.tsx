"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Palette,
  Type,
  MousePointerClick,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const DESIGN_TOKENS = [
  "primary",
  "background",
  "card",
  "muted",
  "border",
  "ring",
  "foreground",
  "secondary",
  "destructive",
  "accent",
  "input",
] as const;

function getTokenValue(name: string): string {
  if (typeof document === "undefined") return "";
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();
    return value || "(yok)";
  } catch {
    return "(yok)";
  }
}

export function DesignClient() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [tokens, setTokens] = useState<{ name: string; value: string }[]>([]);

  const updateTokens = useCallback(() => {
    setTokens(
      DESIGN_TOKENS.map((name) => ({
        name,
        value: getTokenValue(name),
      }))
    );
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    updateTokens();
    const observer = new MutationObserver(updateTokens);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [mounted, updateTokens]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="h-12 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-6 w-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">N-AND-D Design System</Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
            Design Rules
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Premium + güven veren inşaat/yatırım UI standardı.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {resolvedTheme === "dark" ? "Koyu" : "Açık"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={resolvedTheme === "dark" ? "Açık tema" : "Koyu tema"}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </header>

      <Separator />

      {/* A) Foundations / Color Palette */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="size-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Foundations / Renk Paleti
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokens.map(({ name, value }) => (
            <Card key={name} className="overflow-hidden">
              <div
                className="h-20 w-full"
                style={{ backgroundColor: `var(--${name})` }}
              />
              <CardContent className="p-3">
                <p className="font-mono text-xs font-medium text-foreground">
                  {name}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {name === "primary" && "Primary Blue – güven & premium"}
                  {name === "background" && "Sayfa arka planı"}
                  {name === "card" && "Kart yüzeyi"}
                  {name === "muted" && "İkincil alanlar"}
                  {name === "destructive" && "Uyarı / silme"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* B) Typography Scale */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <Type className="size-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Tipografi Ölçeği (Geist + Manrope)
          </h2>
        </div>

        <div className="space-y-4 font-geist">
          <h3 className="text-lg font-semibold text-foreground">
            Geist – Başlıklar (inşaat / yatırım)
          </h3>
          <h1 className="text-4xl font-semibold tracking-tight">H1 Başlık</h1>
          <h2 className="text-3xl font-semibold">H2 Başlık</h2>
          <h3 className="text-2xl font-semibold">H3 Başlık</h3>
          <h4 className="text-xl font-semibold">H4 Başlık</h4>
          <h5 className="text-lg font-semibold">H5 Başlık</h5>
          <h6 className="text-base font-semibold">H6 Başlık</h6>
          <p className="max-w-xl leading-relaxed text-foreground">
            Montenegro&apos;da yatırım ve inşaat süreçleri güvenle yürütülür.
            Anahtar teslim projeler, yasal uyum ve şeffaf süreçlerle desteklenir.
          </p>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            İkinci paragraf – muted rengi ile. Yatırımcılar için net bilgi ve
            iletişim önceliklidir.
          </p>
          <p className="text-sm text-muted-foreground">Küçük / muted metin</p>
          <a href="#" className="text-primary underline-offset-4 hover:underline">
            Link örneği
          </a>
          <ul className="list-inside list-disc space-y-1 text-foreground">
            <li>Keşif ve değerlendirme</li>
            <li>Sözleşme ve ödeme planı</li>
            <li>Teslim ve tapu</li>
          </ul>
          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
            Alıntı metni – inşaat ve yatırım güveni.
          </blockquote>
        </div>

        <div className="space-y-4">
          <h3 className="font-geist text-lg font-semibold text-foreground">
            Manrope – Sayılar (tabular-nums)
          </h3>
          <div className="font-numbers space-y-2 text-xl">
            <p>€250.000</p>
            <p>€1.450.000</p>
            <p>ROI %8,75</p>
            <p>24 ay</p>
            <p>01/07/2026 10:45</p>
          </div>
          <div className="font-numbers grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-2xl font-semibold">€185.000</p>
              <p className="text-sm text-muted-foreground">Başlangıç fiyatı</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-2xl font-semibold">%7,2</p>
              <p className="text-sm text-muted-foreground">Tahmini getiri</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-2xl font-semibold">18 ay</p>
              <p className="text-sm text-muted-foreground">Teslim süresi</p>
            </div>
          </div>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Premium tipografi kuralları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>• Başlıklar: 600/650 ağırlık bandı</p>
            <p>• Gövde: 400/450</p>
            <p>• Etiketler: 500</p>
            <p>• H1 tracking daha sıkı, gövde normal, line-height gövde 1.6</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* C) Button Matrix */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <MousePointerClick className="size-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Button Matrix (variant / size / state)
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Variant
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Size
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">sm</Button>
              <Button size="default">default</Button>
              <Button size="lg">lg</Button>
              <Button size="icon" aria-label="İkon">
                <Sun className="size-4" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              State
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="pointer-events-none bg-primary/90">
                Hover (simüle)
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* D) Form Elements */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <FileText className="size-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Form Elemanları
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Focus ring&apos;i Tab ile test edin.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="input-normal">Input (normal)</Label>
            <Input id="input-normal" placeholder="Placeholder örnek" />
            <p className="text-xs text-muted-foreground">Yardımcı metin</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="input-disabled">Input (disabled)</Label>
            <Input id="input-disabled" disabled placeholder="Devre dışı" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="textarea-demo">Textarea</Label>
            <Textarea
              id="textarea-demo"
              placeholder="Mesajınızı yazın..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="check-demo" />
            <Label htmlFor="check-demo">Checkbox</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="switch-demo" />
            <Label htmlFor="switch-demo">Switch</Label>
          </div>
          <div className="space-y-2">
            <Label>Select</Label>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Seçenek 1</SelectItem>
                <SelectItem value="2">Seçenek 2</SelectItem>
                <SelectItem value="3">Seçenek 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* E) Interaction & A11y */}
      <section className="space-y-8">
        <div className="flex items-center gap-2">
          <Zap className="size-6 text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Etkileşim ve Erişilebilirlik
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-primary" />
                Touch target ≥ 44px
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Varsayılan buton yüksekliği 36px (sm: 32px). İkon buton 36px.
              Input 36px. Mobilde 44px hedefi için lg/px kullanın.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="size-4 text-primary" />
                Focus-visible
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tüm etkileşimli öğelerde focus-visible:ring-[3px] ile ring var.
              Klavye ile Tab ile gezinerek kontrol edin.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* F) Components in Context */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Bileşenler Bağlamda (inşaat / yatırım)
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden">
            <div className="h-40 bg-muted" />
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit">
                Proje
              </Badge>
              <CardTitle className="text-lg">Proje Kartı</CardTitle>
              <p className="text-sm text-muted-foreground">
                Görsel placeholder, badge, başlık, kısa açıklama ve CTA.
              </p>
            </CardHeader>
            <CardContent>
              <Button size="sm">Detay</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Fiyat / Teklif Kartı</CardTitle>
              <p className="font-numbers text-2xl font-semibold">€250.000</p>
              <p className="text-sm text-muted-foreground line-through">
                €285.000
              </p>
              <p className="text-sm text-muted-foreground">
                Manrope fiyat + eski fiyat + CTA.
              </p>
            </CardHeader>
            <CardContent>
              <Button size="sm">Teklif Al</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Süreç / Zaman Çizelgesi</CardTitle>
              <ol className="list-inside space-y-1 text-sm text-muted-foreground">
                <li>1. Keşif</li>
                <li>2. Sözleşme</li>
                <li>3. Teslim</li>
              </ol>
            </CardHeader>
            <CardContent>
              <Button size="sm">Başlayın</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

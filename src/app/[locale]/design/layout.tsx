import { Geist, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(geist.variable, manrope.variable)}>{children}</div>
  );
}

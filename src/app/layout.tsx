import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { Providers } from "@/components/providers/Providers";
import { BookmarkNavigation } from "@/components/navigation/BookmarkNavigation";
import { Footer } from "@/components/navigation/Footer";
import { StickerLayer } from "@/components/eggs/StickerLayer";
import { EggWatcher } from "@/components/eggs/EggWatcher";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "700", "800"], display: "swap" });
const hand = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const serif = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["700", "900"], style: ["normal", "italic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — a developer's diary`, template: `%s · ${site.name}'s diary` },
  description: site.tagline,
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    title: `${site.name} — a developer's diary`,
    description: site.tagline,
    siteName: `${site.name}'s diary`,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#F5EBD8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${hand.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body className="relative min-h-screen">
        <Providers>
          <BookmarkNavigation />
          <StickerLayer />
          <EggWatcher />
          <main id="main" className="relative overflow-x-clip">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

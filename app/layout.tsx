import type { Metadata, Viewport } from "next";
import { Geist_Mono, IBM_Plex_Sans_Thai_Looped, Mali } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
  display: "swap",
});

const plex = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-plex",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NekoQR — ย่อลิงก์น่ารักๆ กับน้องแมวส้ม",
    template: "%s · NekoQR",
  },
  description: "ย่อลิงก์ยาวให้สั้น จำง่าย พร้อม QR code ลายแมวส้ม ดูยอดคลิกได้ทุกลิงก์",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1c130d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${mali.variable} ${plex.variable} ${mono.variable} scroll-pt-[84px]`}>
      <body
        className={[
          "flex min-h-dvh flex-col bg-bg font-sans leading-relaxed text-ink antialiased",
          "bg-[radial-gradient(1200px_500px_at_85%_-10%,var(--c-orange-tint),transparent_60%),radial-gradient(900px_420px_at_-10%_10%,var(--c-pink-soft),transparent_55%)] bg-no-repeat",
          // headings use the display font
          "[&_h1]:font-display [&_h1]:text-balance [&_h2]:font-display [&_h2]:text-balance [&_h3]:font-display",
          // one consistent keyboard focus ring for links, buttons and inputs
          "[&_:focus-visible]:rounded-[10px] [&_:focus-visible]:outline-3 [&_:focus-visible]:outline-offset-3 [&_:focus-visible]:outline-focus",
        ].join(" ")}
      >
        <a
          href="#main"
          className="absolute -top-16 left-4 z-50 rounded-full bg-ink px-4 py-2.5 font-semibold text-bg no-underline transition-[top] focus:top-3"
        >
          ข้ามไปยังเนื้อหา
        </a>
        <SiteHeader />
        <main id="main" className="flex-1 pb-[72px]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

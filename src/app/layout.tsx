import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kanban.isdevs.cv"),
  title: {
    default: "OpenKanban - Your Board, Your URL",
    template: "%s | OpenKanban",
  },
  description:
    "A sleek, real-time Kanban board with no signup required. Just type a URL and start organizing instantly across devices.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "kanban",
    "project management",
    "realtime",
    "board",
    "no signup kanban",
    "ephemeral boards",
    "productivity utility",
    "open source kanban",
  ],
  openGraph: {
    title: "OpenKanban - Realtime Kanban Boards",
    description:
      "Instantly create realtime Kanban boards with zero signup. If you know the URL, you have the keys.",
    url: "/",
    siteName: "OpenKanban",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenKanban - Real-time Ephemeral Kanban Boards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenKanban - Realtime Boards",
    description: "Instantly create realtime Kanban boards with zero signup.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${bricolage.variable} bg-black font-sans text-white antialiased`}
      >
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD schema injectiontant
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OpenKanban",
              description:
                "A sleek, real-time Kanban board with no signup required. Just type a URL and start organizing instantly across devices.",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <OfflineBanner />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111",
              border: "1px solid #1a1a1a",
              color: "#fff",
            },
          }}
          visibleToasts={5}
          richColors
        />
      </body>
    </html>
  );
}

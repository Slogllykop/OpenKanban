import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
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
  metadataBase: "https://kanban.isdevs.cv",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenKanban - Realtime Boards",
    description: "Instantly create realtime Kanban boards with zero signup.",
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
        className={`${inter.variable} ${bricolage.variable} font-sans antialiased bg-black text-white`}
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
        {children}
      </body>
    </html>
  );
}

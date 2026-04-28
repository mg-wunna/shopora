import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "../components/Providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SITE_URL } from "../lib/project";
import "./globals.css";

const bodyFont = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Shopora — Premium commerce demo by Mg Wunna",
  description:
    "A portfolio-grade commerce system with a Next.js storefront, React admin console, Hono/oRPC API, MongoDB data model, cart, checkout, payments, and API docs.",
  authors: [{ name: "Mg Wunna", url: "https://mg-wunna.vercel.app/" }],
  openGraph: {
    title: "Shopora — Premium commerce demo",
    description:
      "A fullstack commerce case study: storefront, admin console, API docs, cart, checkout, payments, and seeded product catalog.",
    url: SITE_URL,
    siteName: "Shopora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopora — Premium commerce demo",
    description:
      "A fullstack commerce case study by Mg Wunna with Next.js, React, Hono, oRPC, and MongoDB.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={bodyFont.variable}>
      <body>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-180px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

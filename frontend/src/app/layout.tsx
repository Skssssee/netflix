import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-outfit",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: 'Mizofy Movies — Watch Free Movies & Series Online',
  description:
    'Stream thousands of free movies, series, and exclusive content on Mizofy Movies. Discover the latest releases and popular categories — all in one place.',
  keywords: 'Mizofy Movies, free movies online, watch movies, streaming, series, videos',
  openGraph: {
    type: 'website',
    title: 'Mizofy Movies — Watch Free Movies & Series Online',
    description: 'Stream thousands of free movies and series on Mizofy Movies.',
    siteName: 'Mizofy Movies',
  },
};

import ApiBootstrap from "@/components/ApiBootstrap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className={`font-poppins bg-black text-white min-h-screen antialiased`} suppressHydrationWarning>
        <ApiBootstrap />
        {children}
      </body>
    </html>
  );
}

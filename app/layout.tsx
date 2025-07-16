import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HARSLE - Stock Sheet Metal Machinery & Press Brake Equipment",
  description: "HARSLE offers premium stock sheet metal machinery including press brakes, bending machines, and industrial equipment. Browse our inventory of ready-to-ship metal fabrication machines with immediate delivery.",
  keywords: [
    "HARSLE",
    "sheet metal machinery",
    "press brake",
    "bending machine",
    "metal fabrication equipment",
    "industrial machinery",
    "stock machinery",
    "press brake machine",
    "CNC press brake",
    "hydraulic press brake",
    "sheet metal bending",
    "metal working equipment",
    "manufacturing machinery",
    "ready to ship machinery"
  ],
  authors: [{ name: "HARSLE" }],
  creator: "HARSLE",
  publisher: "HARSLE",
  robots: "index, follow",
  openGraph: {
    title: "HARSLE - Stock Sheet Metal Machinery & Press Brake Equipment",
    description: "Premium stock sheet metal machinery including press brakes, bending machines, and industrial equipment. Ready-to-ship metal fabrication machines with immediate delivery.",
    url: defaultUrl,
    siteName: "HARSLE",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HARSLE - Stock Sheet Metal Machinery & Press Brake Equipment",
    description: "Premium stock sheet metal machinery including press brakes, bending machines, and industrial equipment. Ready-to-ship metal fabrication machines with immediate delivery.",
    creator: "@HARSLE",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href={defaultUrl} />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

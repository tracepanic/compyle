import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/providers/auth.provider";
import { LayoutProvider } from "@/providers/layout.provider";
import { NotificationProvider } from "@/providers/notification.provider";
import { QueryProvider } from "@/providers/query.provider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { manrope } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Basic metadata
  title: {
    template: "%s | Compyle Apps",
    default: "Compyle Apps | Apps Built With Compyle.ai",
  },
  description: "Discover incredible applications built with Compyle.ai",

  // Canonical URL and base URL for metadata
  metadataBase: new URL("https://compyle.tracepanic.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },

  // Open Graph metadata for social sharing
  openGraph: {
    title: "Compyle Apps | Apps Built With Compyle.ai",
    description: "Discover incredible applications built with Compyle.ai",
    url: "https://compyle.tracepanic.com",
    siteName: "Compyle Apps",
    images: [
      {
        url: "https://compyle.tracepanic.com/hero.png",
        width: 1200,
        height: 630,
        alt: "Compyle Apps | Apps Built With Compyle.ai",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    title: "Compyle Apps | Apps Built With Compyle.ai",
    description: "Discover incredible applications built with Compyle.ai",
    creator: "@compyle_ai",
    images: ["https://compyle.tracepanic.com/hero.png"],
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  // Manifest
  manifest: "https://compyle.tracepanic.com/manifest.json",

  // Additional metadata
  keywords: ["ai-agent", "next.js", "compyle", "ai"],
  generator: "Next.js",
  authors: [{ name: "Patrick Obama", url: "https://tracepanic.com/profile" }],
  creator: "Patrick Obama",
  publisher: "Patrick Obama",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // App information
  applicationName: "Compyle Apps",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Compyle Apps" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <NotificationProvider>
                <Toaster />
                <Analytics />
                <LayoutProvider>{children}</LayoutProvider>
                <NextTopLoader color="#0326FF" showSpinner={false} />
              </NotificationProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

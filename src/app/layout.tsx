import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kingnect — Tu negocio en un Kinec profesional con QR",
  description:
    "Todos los links de tu negocio en un Kinec profesional con QR, lista para compartir e imprimir en tarjetas, carpas, banderas, flyers, stickers, menús y publicidad.",
  keywords: [
    "Kingnect",
    "Kinec",
    "QR",
    "negocio",
    "link en bio",
    "tarjetas digitales",
    "menú digital",
  ],
  authors: [{ name: "King Designs" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Kingnect — Kinec profesional con QR",
    description:
      "Todos los links de tu negocio en un Kinec profesional con QR",
    url: "https://links.kingnect.app",
    siteName: "Kingnect",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4A849",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

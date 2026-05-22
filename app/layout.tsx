import type { Metadata, Viewport } from "next";
import { Outfit, Cinzel, Montserrat } from "next/font/google";
import "./globals.css";

// Fuentes tipográficas premium
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barbería La Chata - Premium PWA",
  description: "Reserva tu cita en Barbería La Chata. Cortes premium y barbería de clase mundial desde tu dispositivo móvil.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "La Chata",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/logo.svg",
    apple: "/icons/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#070709",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Optimización completa para iPhones con notch / Safe Area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${cinzel.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        {/* Metatags nativos PWA adicionales para soporte heredado */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/logo.svg" />
        
        {/* Enlace a fuentes de respaldo de Google Fonts Cinzel para mayor elegancia */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;600;700&family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-dark-950 text-white overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "ONE — Community Services", template: "%s · ONE" },
  description: "Report. Request. Track. Connect. Community services with measurable impact.",
  applicationName: "ONE Community Services",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/system-logo.png", type: "image/png", sizes: "1278x1230" }],
    apple: [{ url: "/brand/system-logo.png", type: "image/png", sizes: "1278x1230" }],
    shortcut: ["/brand/system-logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ONE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d223d" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={inter.variable} data-scroll-behavior="smooth"><body><PwaRegistration />{children}</body></html>;
}

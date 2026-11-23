import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jhansi & Ramesh's Wedding Journey",
  description: "Join us to celebrate the wedding ceremonies and celebrations of Jhansi & Ramesh from December 16 to 18, 2026.",
  openGraph: {
    title: "Jhansi & Ramesh's Wedding Journey",
    description: "Join us to celebrate the wedding ceremonies and celebrations of Jhansi & Ramesh from December 16 to 18, 2026.",
    url: '/events',
    siteName: 'Jhansi & Ramesh Wedding',
    images: [
      {
        url: '/wedding-preview.png',
        width: 1200,
        height: 630,
        alt: 'Wedding Journey Event Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jhansi & Ramesh's Wedding Journey",
    description: "Join us to celebrate the wedding ceremonies and celebrations of Jhansi & Ramesh.",
    images: ['/wedding-preview.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
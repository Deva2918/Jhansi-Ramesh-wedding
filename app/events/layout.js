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
        url: '/events-preview.png',
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
    images: ['/events-preview.png'],
  },
};

export default function EventsLayout({ children }) {
  return <>{children}</>;
}
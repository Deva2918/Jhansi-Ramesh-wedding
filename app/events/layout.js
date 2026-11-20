export const metadata = {
  title: "Vineela & Venkat's Wedding Journey",
  description: "Join us to celebrate the wedding ceremonies and celebrations of Vineela & Venkat from September 4 to 6, 2026.",
  openGraph: {
    title: "Vineela & Venkat's Wedding Journey",
    description: "Join us to celebrate the wedding ceremonies and celebrations of Vineela & Venkat from September 4 to 6, 2026.",
    url: '/events',
    siteName: 'Vineela & Venkat Wedding',
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
    title: "Vineela & Venkat's Wedding Journey",
    description: "Join us to celebrate the wedding ceremonies and celebrations of Vineela & Venkat.",
    images: ['/events-preview.png'],
  },
};

export default function EventsLayout({ children }) {
  return <>{children}</>;
}
import { Inter } from 'next/font/google';
// @ts-ignore - CSS imports don't have TypeScript declarations
import '@/styles/globals.css';
import { ExitIntentProvider } from '@/components/providers/ExitIntentProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'ScaleMate - Intelligent Offshore Scaling Calculator',
  description: 'Discover the exact savings you\'ll unlock by scaling your property management team offshore. Get your personalized analysis in minutes.',
  keywords: 'offshore scaling, property management, cost savings, team optimization, business growth',
  authors: [{ name: 'ScaleMate' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6366f1',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ScaleMate - Scale Smart. Save More. Succeed Faster.',
    description: 'Intelligent offshore scaling calculator for property management teams. Free analysis, instant results.',
    url: 'https://scalemate.com',
    siteName: 'ScaleMate',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ScaleMate - Offshore Scaling Calculator',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScaleMate - Intelligent Offshore Scaling Calculator',
    description: 'Discover your offshore scaling potential with our free calculator.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ExitIntentProvider>
          <div id="root">
            {children}
          </div>
        </ExitIntentProvider>
      </body>
    </html>
  );
} 
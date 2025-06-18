import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
// @ts-ignore - CSS imports don't have TypeScript declarations
import '@/styles/globals.css';
import { ExitIntentProvider } from '@/components/providers/ExitIntentProvider';

// Neural font configuration
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: 'ScaleMate 3.0 - AI-Enhanced Offshore Scaling Intelligence',
  description: 'Experience the future of property management scaling with our neural-powered offshore team calculator. Get AI-driven insights and personalized optimization strategies in real-time.',
  keywords: 'AI offshore scaling, neural property management, intelligent team optimization, quantum cost analysis, cyber business growth, AI-powered calculator',
  authors: [{ name: 'ScaleMate AI Labs' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0066FF',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ScaleMate 3.0 - Neural-Powered Offshore Intelligence',
    description: 'Revolutionary AI-enhanced scaling calculator with quantum cost analysis and cyber-intelligent team optimization. Experience the future of property management.',
    url: 'https://scalemate.com',
    siteName: 'ScaleMate AI',
    images: [
      {
        url: '/og-image-neural.png',
        width: 1200,
        height: 630,
        alt: 'ScaleMate 3.0 - AI-Enhanced Offshore Scaling Calculator',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScaleMate 3.0 - AI-Enhanced Offshore Intelligence',
    description: 'Revolutionary neural-powered scaling calculator with quantum insights and cyber-intelligent optimization.',
    images: ['/og-image-neural.png'],
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
    <html 
      lang="en" 
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="ai-enhanced" content="true" />
        <meta name="neural-version" content="3.0" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-white via-neural-blue-50/30 to-quantum-purple-50/30 min-h-screen relative overflow-x-hidden`}>
        {/* Neural background pattern */}
        <div className="fixed inset-0 pattern-neural-grid opacity-20 pointer-events-none" />
        
        {/* Quantum floating orbs */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-neural-blue-400/20 to-quantum-purple-400/20 rounded-full blur-3xl animate-neural-float pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-quantum-purple-400/20 to-cyber-green-400/20 rounded-full blur-3xl animate-neural-float [animation-delay:2s] pointer-events-none" />
        <div className="fixed top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-cyber-green-400/20 to-matrix-orange-400/20 rounded-full blur-3xl animate-neural-float [animation-delay:4s] pointer-events-none" />
        
        {/* Neural mesh gradient overlay */}
        <div className="fixed inset-0 bg-neural-mesh opacity-5 pointer-events-none" />
        
        <ExitIntentProvider>
          <div id="root" className="relative z-10">
            {children}
          </div>
        </ExitIntentProvider>
        

      </body>
    </html>
  );
} 
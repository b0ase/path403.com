import './globals.css';
import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Space_Grotesk,
  JetBrains_Mono,
  Orbitron
} from 'next/font/google';
import ConditionalProviders from '@/components/ConditionalProviders';

// Core fonts only - reduced from 14+ to 3 essential fonts
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  preload: false
});

export const metadata: Metadata = {
  title: 'b0ase.com',
  description: 'Venture studio building companies from concept to exit. Web development, blockchain integration, AI agents, and digital products.',
  metadataBase: new URL('https://b0ase.com'),
  icons: {
    icon: '/boase_icon.png',
    shortcut: '/boase_icon.png',
    apple: '/boase_icon.png',
  },
  keywords: [
    'venture studio',
    'startup builder',
    'web development',
    'blockchain integration',
    'AI agents',
    'React',
    'Next.js',
    'digital products',
    'tokenization',
    'portfolio'
  ],
  authors: [{ name: 'B0ASE', url: 'https://b0ase.com' }],
  creator: 'B0ASE',
  publisher: 'B0ASE',
  openGraph: {
    title: 'b0ase.com',
    description: 'Venture studio building companies from concept to exit. Web development, blockchain integration, AI agents, and digital products.',
    url: 'https://b0ase.com',
    siteName: 'B0ASE',
    images: [
      {
        url: 'https://b0ase.com/og-fallback.jpg',
        width: 1200,
        height: 630,
        alt: 'B0ASE - Venture Studio',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'b0ase.com',
    description: 'Venture studio building companies from concept to exit.',
    images: ['https://b0ase.com/og-fallback.jpg'],
    creator: '@b0ase',
  },
  alternates: {
    canonical: 'https://b0ase.com',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Critical inline CSS for instant theme application before external CSS loads */}
        {/* SECURITY: Safe to use dangerouslySetInnerHTML - static CSS written by developers, no user input */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html[data-color-theme="white"],
              html[data-color-theme="white"] body {
                background-color: #ffffff !important;
                color: #000000 !important;
              }
              html[data-color-theme="white"] .bg-black {
                background-color: #ffffff !important;
              }
              html[data-color-theme="white"] .text-white {
                color: #000000 !important;
              }
              html[data-color-theme="white"] .dark\\:text-white {
                color: #000000 !important;
              }
              html[data-color-theme="white"] .dark\\:bg-black {
                background-color: #ffffff !important;
              }
            `,
          }}
        />
        {/* Inline script to prevent flash of wrong theme on page load */}
        {/* SECURITY: Safe to use dangerouslySetInnerHTML - static JavaScript written by developers, no user input */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var validThemes = ['black', 'white', 'yellow', 'red', 'green', 'blue', 'pink'];
                  var lightTextThemes = ['white', 'yellow', 'red', 'green', 'blue', 'pink'];

                  // Check if user manually set a theme
                  var manuallySet = localStorage.getItem('b0ase-theme-manual') === 'true';
                  var savedTheme = localStorage.getItem('b0ase-color-theme');

                  var colorTheme;
                  if (manuallySet && savedTheme && validThemes.includes(savedTheme)) {
                    // User manually chose - respect their choice
                    colorTheme = savedTheme;
                  } else {
                    // Auto-detect based on time of day (6am-6pm = white, otherwise black)
                    var hour = new Date().getHours();
                    colorTheme = (hour >= 6 && hour < 18) ? 'white' : 'black';
                  }

                  document.documentElement.setAttribute('data-color-theme', colorTheme);
                  // Set dark class based on theme
                  if (lightTextThemes.includes(colorTheme)) {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Structured Data - Organization Schema */}
        {/* SECURITY: Safe to use dangerouslySetInnerHTML - JSON.stringify() safely encodes all data, no XSS risk */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "B0ASE",
              "description": "Venture studio building companies from concept to exit. Web development, blockchain integration, AI agents, and digital products.",
              "url": "https://b0ase.com",
              "logo": "https://b0ase.com/boase_icon.png",
              "foundingDate": "2020",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "GB"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "richard@b0ase.com",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://github.com/b0ase",
                "https://twitter.com/b0ase"
              ],
              "offers": {
                "@type": "Service",
                "serviceType": [
                  "Web Development",
                  "Venture Building",
                  "Blockchain Integration",
                  "AI Agent Development",
                  "Tokenization"
                ]
              }
            })
          }}
        />

        {/* Structured Data - Website Schema */}
        {/* SECURITY: Safe to use dangerouslySetInnerHTML - JSON.stringify() safely encodes all data, no XSS risk */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "B0ASE",
              "description": "Venture studio building companies from concept to exit",
              "url": "https://b0ase.com",
              "publisher": {
                "@type": "Organization",
                "name": "B0ASE"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://b0ase.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
      </head>
      <body className={`${inter.className} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${orbitron.variable}`} suppressHydrationWarning>
        <ConditionalProviders>
          {children}
        </ConditionalProviders>
      </body>
    </html>
  );
}

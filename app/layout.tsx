import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { Analytics } from '@/components/providers/Analytics'
import { FeatureFlagProvider } from '@/lib/feature-flags/FeatureFlagProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'QuantGrid - Enterprise Energy Trading Platform',
    template: '%s | QuantGrid'
  },
  description: 'Revolutionary enterprise-grade energy trading platform with AI-powered optimization, real-time analytics, and visual knowledge graphs. Transform your energy portfolio management.',
  keywords: [
    'energy trading',
    'energy optimization',
    'renewable energy',
    'grid management',
    'energy analytics',
    'enterprise software',
    'trading platform',
    'energy market',
    'portfolio management',
    'AI optimization',
    'real-time analytics',
    'knowledge graphs',
    'QuantGrid'
  ],
  authors: [{ name: 'QuantGrid Team' }],
  creator: 'QuantGrid',
  publisher: 'QuantGrid',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://quantgrid.energy'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'hi-IN': '/hi',
      'es-ES': '/es',
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quantgrid.energy',
    title: 'QuantGrid - Enterprise Energy Trading Platform',
    description: 'Revolutionary enterprise-grade energy trading platform with AI-powered optimization and real-time analytics.',
    siteName: 'QuantGrid',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'QuantGrid Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantGrid - Enterprise Energy Trading Platform',
    description: 'Revolutionary enterprise-grade energy trading platform with AI-powered optimization and real-time analytics.',
    images: ['/images/twitter-image.jpg'],
    creator: '@quantgrid_energy',
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Enterprise Software, Energy Technology, Trading Platform',
  referrer: 'origin-when-cross-origin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Use Google Fonts for Inter instead of local file */}

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//api.mapbox.com" />
        <link rel="dns-prefetch" href="//events.mapbox.com" />

        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'QuantGrid',
              url: 'https://quantgrid.energy',
              logo: 'https://quantgrid.energy/logo.png',
              description: 'Enterprise-grade energy trading platform with AI-powered optimization and real-time analytics.',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
              },
              sameAs: [
                'https://linkedin.com/company/quantgrid',
                'https://twitter.com/quantgrid',
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Skip to main content
        </a>

        {/* React Query Provider */}
        <QueryProvider>
          {/* Authentication Provider */}
          <AuthProvider>
            {/* WebSocket Provider for real-time updates */}
            <WebSocketProvider>
              {/* Feature Flags Provider */}
              <FeatureFlagProvider organizationId="org-123" userId="user-456">
                {/* Theme provider for dynamic theming */}
                <ThemeProvider>
                  {/* Internationalization provider */}
                  <I18nProvider>
                    {/* Analytics tracking */}
                    <Analytics />

                    {/* Main content */}
                    <div id="root" className="min-h-screen flex flex-col">
                      {children}
                    </div>

                    {/* Toast notifications */}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 5000,
                          iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </I18nProvider>
                </ThemeProvider>
              </FeatureFlagProvider>
            </WebSocketProvider>
          </AuthProvider>
        </QueryProvider>

        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
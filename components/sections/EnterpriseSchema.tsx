import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://quantgrid.energy'),
    title: {
      default: 'Enterprise Energy Trading Solutions | QuantGrid',
      template: '%s | QuantGrid'
    },
    description: 'Scale your energy trading operations with our enterprise platform. Advanced analytics, AI optimization, and industry-leading security for Fortune 500 energy companies worldwide.',
    keywords: [
      'enterprise energy trading',
      'energy trading software',
      'enterprise energy analytics',
      'energy market solutions',
      'energy trading platform',
      'fortune 500 energy',
      'enterprise energy software',
      'AI energy trading',
      'real-time energy analytics',
      'energy trading optimization'
    ],
    authors: [{ name: 'QuantGrid Team' }],
    creator: 'QuantGrid',
    publisher: 'QuantGrid',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://quantgrid.energy/enterprise',
      title: 'Enterprise Energy Trading Solutions | QuantGrid',
      description: 'Scale your energy trading operations with our enterprise platform. Advanced analytics, AI optimization, and industry-leading security for Fortune 500 energy companies worldwide.',
      siteName: 'QuantGrid',
      images: [
        {
          url: '/images/enterprise-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'QuantGrid Enterprise Energy Trading Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Enterprise Energy Trading Solutions | QuantGrid',
      description: 'Scale your energy trading operations with our enterprise platform. Advanced analytics, AI optimization, and industry-leading security for Fortune 500 energy companies worldwide.',
      images: ['/images/enterprise-twitter-image.jpg'],
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
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  }
}

export function EnterpriseSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "QuantGrid",
    "alternateName": "QuantGrid",
    "url": "https://quantgrid.energy",
    "logo": "https://quantgrid.energy/images/logo.png",
    "foundingDate": "2020",
    "description": "Enterprise energy trading platform with AI-powered optimization, real-time analytics, and visual knowledge graphs for energy professionals.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Energy Tech Blvd",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-ENERGY",
      "contactType": "sales",
      "email": "enterprise@quantgrid.energy",
      "availableLanguage": ["English"]
    },
    "sameAs": [
      "https://linkedin.com/company/quantgrid",
      "https://twitter.com/quantgrid",
      "https://github.com/Mukesh1q2/QuantGrid-"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Enterprise Energy Trading Platform",
        "description": "Comprehensive enterprise energy trading platform with AI optimization and real-time analytics.",
        "category": "Software",
        "availability": "InStock"
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  )
}
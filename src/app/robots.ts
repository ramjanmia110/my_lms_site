import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/login',
          '/signup',
          '/register',
          '/payment/',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/callback',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

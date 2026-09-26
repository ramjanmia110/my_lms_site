const DEV_API_URL = 'http://localhost:8000/api'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// A production bundle must never point at localhost. It "works" locally, so
// the mistake survives review, and then fails on the deployed site as a CORS
// error against http://localhost:8000. Fail the build instead of shipping it.
if (process.env.NODE_ENV === 'production') {
  if (!apiUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_API_URL. Set it to the public URL of your Laravel API ' +
        '(e.g. https://api.your-domain.com/api) in the Vercel project settings. ' +
        'See .env.example.',
    )
  }
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/.test(apiUrl)) {
    throw new Error(
      `NEXT_PUBLIC_API_URL is "${apiUrl}", which points at localhost. Production ` +
        'builds must use the public URL of your deployed Laravel API. ' +
        'See .env.example.',
    )
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plain-apac-prod-public.komododecks.com' },
      { protocol: 'https', hostname: 'kommodo.ai' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl || DEV_API_URL,
  },
}

module.exports = nextConfig

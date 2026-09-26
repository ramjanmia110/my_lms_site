const DEV_API_URL = 'http://localhost:8000/api'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const isProd = process.env.NODE_ENV === 'production'

// Diagnostics only. This must NOT throw: a missing API URL used to abort
// `next build`, which left Vercel promoting the previous deployment, so the
// client-side crash fix never reached production. Warn loudly instead, and
// keep the invariant that matters -- a production bundle never silently falls
// back to localhost.
if (isProd && !apiUrl) {
  console.warn(
    '\n[config] NEXT_PUBLIC_API_URL is not set.\n' +
      '        The deployed build cannot reach the Laravel API. Set it in Vercel\n' +
      '        (Project Settings -> Environment Variables) to the public API URL\n' +
      '        including the /api prefix, e.g. https://api.your-domain.com/api\n' +
      '        See .env.example.\n',
  )
}

if (isProd && apiUrl && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:|\/|$)/.test(apiUrl)) {
  console.warn(
    `\n[config] NEXT_PUBLIC_API_URL is "${apiUrl}", which points at localhost.\n` +
      '        Every API request from the deployed site will fail with a CORS\n' +
      '        error. Point it at your public API URL.\n',
  )
}

const resolvedApiUrl = apiUrl || (isProd ? '' : DEV_API_URL)

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
    NEXT_PUBLIC_API_URL: resolvedApiUrl,
  },
}

module.exports = nextConfig

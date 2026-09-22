import type { Metadata } from 'next'
import { Poppins, Playfair_Display, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import QueryProvider from '@/components/layout/QueryProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Learn2Earn - Learn Skills. Build Career. Earn Online.',
  description:
    'Master AI, development, design and freelancing skills with expert instructors. Start your learning journey with Learn2Earn.',
  keywords: [
    'Learn2Earn',
    'LMS',
    'AI Learning',
    'Online Courses',
    'Skill Development',
    'Freelancing',
    'Learn Online',
  ],
  openGraph: {
    title: 'Learn2Earn - Learn Skills. Build Career. Earn Online.',
    description:
      'Master AI, development, design and freelancing skills with expert instructors.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

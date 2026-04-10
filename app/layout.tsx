import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/auth/session-provider'
import { AppHeader } from '@/components/layout/app-header'

export const metadata: Metadata = {
  title: 'SEO Data Platform',
  description: 'Dedupe-first Local SEO data platform',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}

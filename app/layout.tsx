import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { TransactionModal } from '@/components/features/TransactionModal'
import { RootClient } from '@/app/RootClient'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '가계부 - Household Budget App',
  description: '가정의 가계부를 쉽게 관리하세요',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-secondary text-primary">
        <RootClient>
          <div className="flex flex-col lg:flex-row min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Navigation />
              <main className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <TransactionModal />
        </RootClient>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zero-Input Finance',
  description: 'Gestão financeira inteligente sem entrada manual. Deixe a IA organizar suas finanças.',
  keywords: ['finanças pessoais', 'gestão financeira', 'IA', 'automatização'],
  authors: [{ name: 'Zero-Input Finance' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <main className="min-h-screen bg-background antialiased">
          {children}
        </main>
      </body>
    </html>
  )
}

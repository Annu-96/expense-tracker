import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Student Expense Tracker',
  description: 'Track and Manage all of your expenses',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

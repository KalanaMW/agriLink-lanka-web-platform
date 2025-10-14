import type { Metadata } from 'next';
import { Inter } from 'next/font/google'
// @ts-ignore
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgriLink Lanka - Connect Farmers with Exporters',
  description: 'Sri Lankan agricultural marketplace connecting local farmers with global exporters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />


        <main className="flex-grow">
          {children}
        </main>


        <Footer />
      </body>
    </html>
  )
}
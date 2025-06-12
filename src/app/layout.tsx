"use client";

import type React from "react"
import { figtree } from "@/styles/fonts"
import Footer from "@/components/layout/footer"
import "@/styles/globals.css"
import "@/styles/footer.css"
import "@/styles/navbar.css"
import "@/styles/formCard.css"
// import "@/styles/login.css"
import { FooterProvider } from '@/context/FooterContext'
import { usePathname } from 'next/navigation'

const publicRoutes = ['/login', '/signUp', '/forgot-password']

function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showFooter = !publicRoutes.includes(pathname)

  return (
    <div>
      {children}
      {showFooter && <Footer />}
    </div>
  )
}

// Server component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={figtree.className}>
        <FooterProvider>
          <MainLayout>{children}</MainLayout>
        </FooterProvider>
      </body>
    </html>
  )
}

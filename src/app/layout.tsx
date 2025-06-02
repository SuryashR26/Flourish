"use client";

import type React from "react"
import { figtree } from "@/styles/fonts"
import Footer from "@/components/layout/footer"
import "@/styles/globals.css"
// Client components
import { NavbarProvider } from '@/context/NavbarContext'
import { FooterProvider } from '@/context/FooterContext'
import { usePathname } from 'next/navigation'
import Navbar from "@/components/layout/navbar"

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

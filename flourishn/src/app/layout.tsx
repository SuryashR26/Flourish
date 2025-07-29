import type React from "react"
import { figtree } from "@/styles/fonts"
// import Footer from "@/components/layout/footer"
import "@/styles/globals.css"
import "@/styles/footer.css"
import "@/styles/navbar.css"
import "@/styles/formCard.css"
// import "@/styles/login.css"
import { FooterProvider } from '@/context/FooterContext'
import { Metadata } from 'next'
import ClientLayout from '@/components/layout/ClientLayout'
import { UserProvider } from "@/context/UserContext"

export const metadata: Metadata = {
  title: 'Flourish',
  description: 'Where ideas find their people',
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
        <UserProvider>
          <FooterProvider>
            <ClientLayout>{children}</ClientLayout>
          </FooterProvider>
        </UserProvider>
      </body>
    </html>
  )
}

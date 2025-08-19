import type React from "react"
import { figtree } from "@/styles/fonts"
// import Footer from "@/components/layout/footer"
import "@/styles/globals.css"
import "@/styles/footer.css"
import "@/styles/navbar.css"
import "@/styles/formCard.css"
import "@/styles/login.css"
import { FooterProvider } from '@/context/FooterContext'
import { Metadata } from 'next'
import ClientLayout from '@/components/layout/ClientLayout'
import { UserProvider } from "@/context/UserContext"
import NotificationContainer from "@/components/ui/NotificationContainer"

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
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={figtree.className}>
        <UserProvider>
          <FooterProvider>
            <NotificationContainer>
              <ClientLayout>{children}</ClientLayout>
            </NotificationContainer>
          </FooterProvider>
        </UserProvider>
      </body>
    </html>
  )
}

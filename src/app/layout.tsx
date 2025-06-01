import type React from "react"
import type { Metadata } from "next"
import { figtree } from "@/styles/fonts"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Flourish - Let Your Ideas Flourish",
  description: "A platform where you can share your ideas and get feedback from others.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={figtree.className}>
        <Navbar scrollThreshold={750} />
        {children}
        <Footer />
      </body>
    </html>
  )
}

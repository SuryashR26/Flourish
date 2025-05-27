import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <Navbar scrollThreshold={750} />
        <div id="scroll-wrapper" className="overflow-y-auto overflow-x-hidden max-h-screen">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}

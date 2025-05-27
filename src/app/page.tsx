"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Button from "@/components/ui/button"
import Cards from "@/components/cards/cards"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollWrapper = document.getElementById("scroll-wrapper")
      if (scrollWrapper) {
        const scrollTop = scrollWrapper.scrollTop
        const scrollHeight = scrollWrapper.scrollHeight - scrollWrapper.clientHeight
        const progress = (scrollTop / scrollHeight) * 100
        setScrollProgress(progress)
      }
    }

    const scrollWrapper = document.getElementById("scroll-wrapper")
    if (scrollWrapper) {
      scrollWrapper.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollWrapper) {
        scrollWrapper.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  return (
    <>
      {/* Hero Section with Video Background */}
      <div className="h-screen overflow-y-auto scrollbar-hide">
        <div
          className="fixed top-0 left-0 h-1 bg-blue-400 z-[10001] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
        <Image
          src="/Images/applelogostars.png?height=1080&width=1920"
          alt="Background"
          fill
          className="object-cover -z-10 pointer-events-none"
          priority
        />

        <div className="h-screen w-full flex flex-col justify-center items-center relative z-10">
          <h1 className="text-white text-8xl md:text-[100px] -mt-24 text-center z-20 flourish-title">
            LET YOUR IDEAS FLOURISH
          </h1>
          <div className="mt-8 z-20">
            <Link href="/signup">
              <Button className="flourish-title" buttonStyle="outline" buttonSize="large">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />

      {/* Cards Section */}
      <Cards />
    </>
  )
}

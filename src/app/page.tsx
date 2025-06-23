"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Button from "@/components/ui/button"
import Cards from "@/components/cards/cards"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import Navbar from "@/components/layout/navbar"

// Register the SplitText plugin
gsap.registerPlugin(SplitText)

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial calculation

    // GSAP Animation
    document.fonts.ready.then(() => {
      gsap.set('.flourish-title', { opacity: 1 });
      // Animate heading first
      const heading = document.querySelector('h1.flourish-title');
      const description = document.querySelector('.description-text');
      const button = document.querySelector('.btns.flourish-title');
      let headingSplit, descriptionSplit, buttonSplit;
      if (heading) {
        SplitText.create(heading, {
          type: 'words,lines',
          linesClass: 'line',
          autoSplit: true,
          mask: 'lines',
          onSplit: (self) => {
            headingSplit = gsap.from(self.lines, {
              duration: 1.1,
              yPercent: 100,
              opacity: 0,
              stagger: 0.09,
              ease: 'expo.out',
            });
            return headingSplit;
          },
        });
      }
      if (description) {
        SplitText.create(description, {
          type: 'words,lines',
          linesClass: 'line',
          autoSplit: true,
          mask: 'lines',
          onSplit: (self) => {
            descriptionSplit = gsap.from(self.lines, {
              duration: 0.9,
              yPercent: 100,
              opacity: 0,
              stagger: 0.06,
              delay: 0.6, // Staggered after heading
              ease: 'expo.out',
            });
            return descriptionSplit;
          },
        });
      }
      if (button) {
        SplitText.create(button, {
          type: 'words,lines',
          linesClass: 'line',
          autoSplit: true,
          mask: 'lines',
          onSplit: (self) => {
            buttonSplit = gsap.from(self.lines, {
              duration: 0.7,
              yPercent: 100,
              opacity: 0,
              stagger: 0.08,
              delay: 1.2, // Staggered after description
              ease: 'expo.out',
            });
            return buttonSplit;
          },
        });
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      <Navbar />
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Section with Video Background */}
      <div className="h-screen relative">
        {/* Top Fade */}
        <div
          className="pointer-events-none absolute top-0 left-0 w-full h-[240px] z-10"
          style={{
            background: "rgba(0,0,0,0.5)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            backdropFilter: "blur(4px)",
          }}
        />
        {/* Bottom Fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-[200px] z-10"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 40%, #000 100%)",
          }}
        />
        <Image
          src="/Images/nightsky2.avif?height=1080&width=1920"
          alt="Background"
          fill
          className="object-cover -z-10 pointer-events-none"
          priority
        />
        <div className="h-screen w-full flex flex-col justify-center items-center relative z-10 pt-10">
          <h1 className="text-white text-6xl md:text-[90px] text-center z-20 flourish-title transform !translate-y-4 font-semibold">
            LET YOUR IDEAS FLOURISH
          </h1>
          <p className="text-white text-lg md:text-xl text-center max-w-2xl mx-auto !mt-7 !mb-7 px-6 description-text flourish-title opacity-0">
            Flourish is the collaboration platform for creators. Find your team, build your project, and turn your ideas into reality.
          </p>
          <div className="z-20">
            <Link href="/signup">
              <Button
                className="btns flourish-title rounded-3xl px-8 py-3 text-xl font-semibold"
                buttonStyle="outline"
                buttonSize="large"
                animatedBorder={true}
                borderAnimationDelay={1700}
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <Cards />
      <style jsx global>{`
        .description-text div {
          font-weight: 400 !important;
        }
      `}</style>
    </>
  )
}

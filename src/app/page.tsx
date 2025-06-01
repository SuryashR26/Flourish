"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Button from "@/components/ui/button"
import Cards from "@/components/cards/cards"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

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
      const button = document.querySelector('.btns.flourish-title');
      let headingSplit, buttonSplit;
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
              delay: 0.5, // Staggered after heading
              ease: 'expo.out',
              onComplete: () => {
                // Add the animate-border class after text animation completes
                button.classList.add('animate-border');
              }
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
          <h1 className="text-white text-8xl md:text-[100px] text-center z-20 flourish-title transform -translate-y-5">
            LET YOUR IDEAS FLOURISH
          </h1>
          <div className="mt-8 z-20">
            <Link href="/signup">
              <Button 
                className="btns flourish-title rounded-3xl px-8 py-3 text-xl font-semibold"
                buttonStyle="outline"
                buttonSize="large"
                animatedBorder={true}
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <Cards />
    </>
  )
}

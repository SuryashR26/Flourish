"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

      {/* Hero Section with animated gradient background (was a starfield video, replaced for the light theme) */}
      <div className="h-screen relative bg-white overflow-x-hidden">
        {/* Commented out — old dark starfield video background */}
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/starsbackground_noaudio.mp4" type="video/mp4" />
        </video> */}

        {/* Commented out stars for future use */}
        {/* <div className="absolute inset-0">
          <AnimatedStars starCount={800} />
        </div> */}

        {/* Soft blooming gradient background */}
        <div className="hero-bloom absolute inset-0 overflow-hidden">
          <div className="hero-bloom__base absolute inset-0" />
          <div className="hero-bloom__blob hero-bloom__blob--blue absolute rounded-full" />
          <div className="hero-bloom__blob hero-bloom__blob--teal absolute rounded-full" />
          <div className="hero-bloom__blob hero-bloom__blob--rose absolute rounded-full" />
        </div>

        {/* Bottom Fade — blends the hero into the white cards section below */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-[200px] z-10"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 40%, #fff 100%)",
          }}
        />
        <div className="h-screen w-full flex flex-col justify-center items-center relative z-10 pt-10">
          <h1 className="text-gray-900 text-6xl md:text-[90px] text-center z-20 flourish-title transform !translate-y-4 font-semibold">
            LET YOUR IDEAS FLOURISH
          </h1>
          <p className="text-gray-600 text-lg md:text-xl text-center max-w-2xl mx-auto !mt-7 !mb-7 px-6 description-text flourish-title opacity-0">
            Flourish is the collaboration platform for creators. Find your team, build your project, and turn your ideas into reality.
          </p>
          <div className="z-20">
            <Link href="/post">
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

        .hero-bloom__base {
          background: linear-gradient(180deg, #ffffff 0%, #f3f8fe 55%, #eaf3fd 100%);
        }

        .hero-bloom__blob {
          filter: blur(70px);
          opacity: 0.55;
          will-change: transform;
        }

        .hero-bloom__blob--blue {
          width: 42vw;
          height: 42vw;
          max-width: 620px;
          max-height: 620px;
          top: -10%;
          left: -8%;
          background: radial-gradient(circle, #bfe0fc 0%, rgba(191, 224, 252, 0) 70%);
          animation: bloom-drift-1 22s ease-in-out infinite;
        }

        .hero-bloom__blob--teal {
          width: 34vw;
          height: 34vw;
          max-width: 520px;
          max-height: 520px;
          bottom: -8%;
          right: -6%;
          background: radial-gradient(circle, #cdeee2 0%, rgba(205, 238, 226, 0) 70%);
          animation: bloom-drift-2 26s ease-in-out infinite;
        }

        .hero-bloom__blob--rose {
          width: 26vw;
          height: 26vw;
          max-width: 400px;
          max-height: 400px;
          top: 35%;
          right: 12%;
          background: radial-gradient(circle, #f7d9e4 0%, rgba(247, 217, 228, 0) 70%);
          animation: bloom-drift-3 20s ease-in-out infinite;
        }

        @keyframes bloom-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 5%) scale(1.08); }
        }

        @keyframes bloom-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5%, -4%) scale(1.1); }
        }

        @keyframes bloom-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-3%, 4%) scale(1.05); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bloom__blob {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}

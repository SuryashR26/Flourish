"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function ScrollTextAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !lineRef.current) return

    const text = textRef.current!
    const line = lineRef.current!
    
    // Split text into words manually
    const words = text.textContent?.split(' ') || []
    text.innerHTML = '' // Clear the text
    
         // Create spans for each word
     const wordSpans = words.map((word, index) => {
       const span = document.createElement('span')
       span.textContent = word
       span.className = 'word'
       span.style.display = 'inline-block'
       span.style.margin = '0 0.1em' // Reduced margin for less spacing
       span.style.opacity = '0'
       span.style.transform = 'translateY(40px)'
       span.style.position = 'relative'
       span.style.color = 'white' // Ensure white color
       text.appendChild(span)
       
       // Add space after word (except last word)
       if (index < words.length - 1) {
         const space = document.createTextNode(' ')
         text.appendChild(space)
       }
       
       return span
     })

         // Set initial state for animation
     gsap.set(wordSpans, {
       opacity: 0,
       y: 40
     })
     
     // Position line under "every" word immediately
     const everyWord = wordSpans.find(span => span.textContent?.toLowerCase() === 'every')
     if (everyWord) {
       // Wait for DOM to update, then position the line
       setTimeout(() => {
         const lineWidth = everyWord.offsetWidth
         const leftOffset = everyWord.offsetLeft
         
         gsap.set(line, {
           width: lineWidth + 'px',
           left: leftOffset + 'px',
           top: '100%',
           marginTop: '5px',
           scaleX: 0,
           transformOrigin: "left center",
           transform: 'none'
         })
       }, 10)
     } else {
       gsap.set(line, {
         scaleX: 0,
         transformOrigin: "left center"
       })
     }

         // Create main timeline with ScrollTrigger
     const tl = gsap.timeline({
       scrollTrigger: {
         trigger: containerRef.current,
         start: 'top center',
         end: 'bottom center',
         scrub: 1, // Balanced speed for good timing
         onUpdate: (self) => {
           if (progressRef.current) {
             progressRef.current.textContent = Math.round(self.progress * 100) + '%'
           }
         }
       }
     })

         // Add stagger animation for words
     tl.to(wordSpans, {
       opacity: 1,
       y: 0,
       duration: 1,
       stagger: {
         each: 0.2,
         ease: "none"
       },
       ease: "power2.out"
     })

     // Add underline animation for "every" 
     tl.to(line, {
       scaleX: 1,
       duration: 0.4,
       ease: "power2.out"
     }, "-=0.8") // Overlap with word animations

    // Add glow effect for "Flourish" (last word)
    const lastWord = wordSpans[wordSpans.length - 1]
    tl.to(lastWord, {
      color: '#1f98f4',
      textShadow: '0 0 20px #1f98f4, 0 0 40px #1f98f4, 0 0 60px #1f98f4',
      duration: 0.3,
      ease: "power2.out"
    }, "-=0.2")

    

    // Log for debugging
    console.log('Total words:', wordSpans.length)
    console.log('Timeline duration:', tl.duration())

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Instructions */}
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 text-center opacity-70 text-sm z-50 bg-black/50 px-5 py-2.5 rounded">
        ↓ Scroll down slowly to see the stagger animation ↓
      </div>

      {/* Debug Progress */}
      <div className="fixed bottom-5 left-5 text-sm opacity-70 z-50 bg-black/80 px-2.5 py-2.5 rounded">
        Progress: <span ref={progressRef}>0%</span>
      </div>

             {/* Spacer - Further reduced height */}
       <div className="h-[10vh] flex items-center justify-center text-2xl opacity-30">
         <p>Keep scrolling...</p>
       </div>

       {/* Animation Section - Shorter height for faster completion */}
       <div 
         ref={containerRef}
         className="h-[120vh] relative" // Shorter section for faster animation completion
       >
        <div className="text-center p-8" style={{ position: 'sticky', top: '40vh', zIndex: 10 }}>
          <div 
            ref={textRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            We want every idea to Flourish
          </div>
          
                   {/* Animated line under "every" */}
         <div 
           ref={lineRef}
           className="absolute h-1 bg-white rounded-full"
           style={{
             width: "120px", // Will be overridden by JS
             left: "0px", // Will be overridden by JS
             top: "100%", // Will be overridden by JS
             marginTop: "5px"
           }}
         />
        </div>
      </div>

             {/* Bottom Spacer - Further reduced height */}
       <div className="h-[10vh] flex items-center justify-center text-2xl opacity-30">
         <p>Scroll back up to reverse</p>
       </div>
    </>
  )
}

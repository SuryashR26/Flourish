"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function IdeasNeedTeamsSection() {
    const wordsRef = useRef<(HTMLSpanElement | null)[]>([])

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        // Text animation for "Ideas need teams..." section
        const words = document.querySelectorAll('.ideas-word')
        wordsRef.current = Array.from(words) as HTMLSpanElement[]

        const textTrigger = ScrollTrigger.create({
            trigger: ".ideas-animated-text-section",
            start: "top 80%",
            end: "bottom center",
            onUpdate: (self) => {
                const progress = self.progress
                const totalWords = wordsRef.current.length
                const wordsToHighlight = Math.floor(progress * totalWords)

                wordsRef.current.forEach((word, index) => {
                    if (word) {
                        if (index < wordsToHighlight) {
                            word.style.color = "white"
                        } else {
                            word.style.color = "#374151"
                        }
                    }
                })
            }
        })

        return () => {
            textTrigger.kill()
        }
    }, [])

    return (
        <div className="ideas-animated-text-section w-full flex justify-center items-center bg-black relative z-20" style={{ minHeight: '0', paddingTop: '11rem', paddingBottom: '11rem' }}>
            {/* To adjust line breaks, tweak the maxWidth value below (e.g., 700px for 2 lines) */}
            <div className="w-full mx-auto text-center flex flex-col justify-center" style={{ maxWidth: '900px' }}>
                <div className="text-4xl md:text-5xl leading-snug font-semibold">
                    <span className="ideas-word transition-colors duration-300 text-gray-700">Ideas</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">need</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">teams.</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">We</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">make</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">that</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">easy.</span>
                    <br />
                    <span className="ideas-word transition-colors duration-300 text-gray-700">At</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">Flourish,</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">projects</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">find</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">their</span>{" "}
                    <span className="ideas-word transition-colors duration-300 text-gray-700">people.</span>
                </div>
            </div>
        </div>
    )
}

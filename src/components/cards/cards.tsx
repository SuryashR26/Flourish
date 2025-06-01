"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface CardData {
    title: string
    text: string
    link: string
    image: string
}

export default function Cards() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [nextIndex, setNextIndex] = useState(1)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward")
    const [noTransition, setNoTransition] = useState(false)
    const [isScrollingFast, setIsScrollingFast] = useState(false)
    const textBlocksRef = useRef<(HTMLDivElement | null)[]>([])
    const lastScrollTime = useRef(Date.now())
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
    const dashboardImageRef = useRef<HTMLImageElement>(null)
    const dashboardImageContainerRef = useRef<HTMLDivElement>(null)

    const activeIndexRef = useRef(0)
    const isAnimatingRef = useRef(false)
    const flipDirectionRef = useRef<"forward" | "backward">("forward")

    useEffect(() => {
        activeIndexRef.current = activeIndex
        isAnimatingRef.current = isAnimating
    }, [activeIndex, isAnimating])

    useEffect(() => {
        flipDirectionRef.current = flipDirection
    }, [flipDirection])

    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now()
            const timeSinceLastScroll = now - lastScrollTime.current
            lastScrollTime.current = now

            if (timeSinceLastScroll < 100) {
                setIsScrollingFast(true)
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current)
                }
                scrollTimeout.current = setTimeout(() => {
                    setIsScrollingFast(false)
                }, 500)
            }

            if (window.scrollY <= 5) {
                const firstIdx = 0
                setNoTransition(true)
                setActiveIndex(firstIdx)
                setNextIndex(firstIdx)
                setIsFlipped(false)
                isAnimatingRef.current = false
                setIsAnimating(false)
                requestAnimationFrame(() => {
                    setNoTransition(false)
                })
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current)
            }
        }
    }, [])

    const cardData: CardData[] = [
        {
            title: "Everything you need,\nright where you code",
            text: "Thanks to an ecosystem of third-party extensions, Copilot Chat lets you check logs, toggle features, and deploy apps, without ever leaving your editor.",
            link: "Explore extensions",
            image: "/images/dashboard.png",
        },
        {
            title: "Turn your ideas into reality",
            text: "Whether you're a developer, designer, or innovator, our platform gives you the space to showcase your projects and connect with like-minded creators.",
            link: "View projects",
            image: "/images/post.png",
        },
        {
            title: "Discover ideas worth building",
            text: "Explore a growing collection of projects from creators across disciplines. Use smart filters and personalized recommendations to find ideas that spark your interest — and start collaborating right away.",
            link: "Search for projects",
            image: "/images/searchbar.png",
        },
        {
            title: "Grow your skills while you build",
            text: "hand-picked resources to help you learn the skills you need to contribute to the projects you care about — from coding to design to project management. Whether you're just starting out or leveling up, we've got you covered.",
            link: "Build your skills",
            image: "/images/learn.png",
        },
        {
            title: "Meet Flo — your personal idea partner",
            text: "Need help putting thoughts into words? Flo's here to brainstorm with you, clean up your writing, and suggest ways to take your project to the next level. Always ready. Always on your side.",
            link: "Talk to Flo",
            image: "/images/chatbot.png",
        },
    ]

    const handleCardChange = (newIndex: number) => {
        if (isAnimatingRef.current) {
            return
        }

        if (isScrollingFast) {
            setNoTransition(true)
            setActiveIndex(newIndex)
            setNextIndex(newIndex)
            setIsFlipped(false)
            isAnimatingRef.current = false
            setIsAnimating(false)
            requestAnimationFrame(() => {
                setNoTransition(false)
            })
            return
        }

        isAnimatingRef.current = true
        setIsAnimating(true)
        setNoTransition(false)
        setNextIndex(newIndex)
        setIsFlipped(true)
    }

    useEffect(() => {
        const card = document.querySelector(".flip-card") as HTMLElement
        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== "transform") return

            if (isFlipped) {
                setActiveIndex(nextIndex)
                setNoTransition(true)

                requestAnimationFrame(() => {
                    setIsFlipped(false)

                    requestAnimationFrame(() => {
                        setNoTransition(false)
                        isAnimatingRef.current = false
                        setIsAnimating(false)
                    })
                })
            }
        }

        card?.addEventListener("transitionend", handleTransitionEnd)
        return () => card?.removeEventListener("transitionend", handleTransitionEnd)
    }, [isFlipped, nextIndex])

    useEffect(() => {
        const handleScroll = () => {
            const blockPositions = textBlocksRef.current
                .map((el, index) => {
                    if (!el) return { index, top: 0, bottom: 0, height: 0 }
                    const rect = el.getBoundingClientRect()
                    return {
                        index,
                        top: rect.top,
                        bottom: rect.bottom,
                        height: rect.height,
                    }
                })
                .filter((block) => block.height > 0)

            const mostVisibleBlock = blockPositions.reduce((prev, current) => {
                const prevVisibility = Math.min(prev.bottom, window.innerHeight) - Math.max(prev.top, 0)
                const currentVisibility = Math.min(current.bottom, window.innerHeight) - Math.max(current.top, 0)
                return currentVisibility > prevVisibility ? current : prev
            })

            const updateCardState = (newIndex: number) => {
                if (newIndex === activeIndexRef.current || isAnimatingRef.current) return

                setNoTransition(true)
                setActiveIndex(newIndex)
                setNextIndex(newIndex)
                setIsFlipped(false)
                isAnimatingRef.current = false
                setIsAnimating(false)
                requestAnimationFrame(() => {
                    setNoTransition(false)
                })
            }

            if (window.scrollY <= 5) {
                updateCardState(0)
            } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
                updateCardState(blockPositions.length - 1)
            } else {
                updateCardState(mostVisibleBlock.index)
            }
        }

        let ticking = false
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener("scroll", throttledScroll)
        return () => {
            window.removeEventListener("scroll", throttledScroll)
        }
    }, [])

    useEffect(() => {
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = textBlocksRef.current.indexOf(entry.target as HTMLDivElement)
                    if (idx === -1) return

                    if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                        if (idx === activeIndexRef.current || isAnimatingRef.current) {
                            return
                        }

                        const isScrollingDown = idx > activeIndexRef.current

                        setTimeout(() => {
                            if (isScrollingDown) {
                                setFlipDirection("forward")
                                handleCardChange(idx)
                            } else {
                                setFlipDirection("backward")
                                handleCardChange(idx)
                            }
                        }, 50)
                    }
                })
            },
            {
                root: null,
                rootMargin: "-40% 0px -20% 0px",
                threshold: [0.3, 0.5, 0.7],
            },
        )

        const textObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible")
                    }
                })
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            },
        )

        textBlocksRef.current.forEach((el) => {
            if (el) {
                cardObserver.observe(el)
                textObserver.observe(el)
            }
        })

        return () => {
            cardObserver.disconnect()
            textObserver.disconnect()
        }
    }, [])

    return (
        <>
            {/* Dashboard Image Section */}
            <div ref={dashboardImageContainerRef} className="w-full flex justify-center items-center py-10 px-5 bg-black relative z-20">
                <div className="w-full max-w-6xl mx-0 flex justify-center relative">
                    <Image
                        ref={dashboardImageRef}
                        src="/images/dashboard1.png"
                        alt="IdeaBoard Dashboard"
                        width={1000}
                        height={600}
                        className="dashboard-image w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl transform-gpu will-change-transform object-contain transition-transform duration-100 linear backface-hidden"
                    />
                </div>
            </div>

            <div className="w-full flex justify-center">
                <div className="flex relative p-8 bg-black pb-40 w-full max-w-6xl">
                    {/* Text Block Column */}
                    <div className="flex-1 max-w-2xl pr-8 bg-black pl-8 pb-8">
                        {cardData.map((card, index) => (
                            <div
                                key={index}
                                ref={el => { textBlocksRef.current[index] = el; }}
                                className="text-block min-h-screen flex flex-col justify-center p-8 mb-16 bg-black transform translate-y-12 transition-transform duration-700 relative z-10"
                                id={`text-block-${index}`}
                            >
                                <h2 className="text-5xl leading-tight mb-6 text-white whitespace-pre-line">{card.title}</h2>
                                <p className="text-lg leading-relaxed mb-8 text-gray-400 max-w-lg text-left">{card.text}</p>
                                <a
                                    href="#"
                                    className="text-blue-400 no-underline text-lg inline-flex items-center hover:text-blue-300 transition-colors duration-200 group"
                                >
                                    {card.link}
                                    <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Card Image Column */}
                    <div className="sticky -top-1 translate-y-60 transform w-[38vw] h-[52vh] flex justify-center items-center right-8 mr-20">
                        <div
                            className={`flip-card relative w-full h-full perspective-1000 ${isFlipped ? "flipped" : ""
                                } ${noTransition ? "no-transition" : ""} ${flipDirection}`}
                        >
                            <div className="flip-card__front-side absolute top-0 left-0 w-full h-full backface-hidden preserve-3d transition-transform duration-300 ease-out flex items-center justify-center shadow-2xl will-change-transform origin-center transform-gpu rotateX-0 translateZ-0 z-20">
                                <Image
                                    src={cardData[activeIndex].image || "/placeholder.svg"}
                                    alt={cardData[activeIndex].title}
                                    fill
                                    className="object-cover rounded-[35px] w-[90%] h-[90%]"
                                />
                            </div>
                            <div className="flip-card__back-side absolute top-0 left-0 w-full h-full backface-hidden preserve-3d transition-transform duration-300 ease-out flex items-center justify-center shadow-2xl will-change-transform origin-center transform-gpu rotateX-180 translateZ-0 z-10">
                                <Image
                                    src={cardData[nextIndex].image || "/placeholder.svg"}
                                    alt={cardData[nextIndex].title}
                                    fill
                                    className="object-cover rounded-[35px] w-[90%] h-[90%]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .text-block.visible {
          transform: translateY(0);
        }

        .flip-card.no-transition .flip-card__front-side,
        .flip-card.no-transition .flip-card__back-side {
          transition: none;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .flip-card.flipped.forward .flip-card__front-side {
          transform: rotateX(-180deg) translateZ(0);
          z-index: 10;
        }

        .flip-card.flipped.forward .flip-card__back-side {
          transform: rotateX(0deg) translateZ(0);
          z-index: 20;
        }

        .flip-card.flipped.backward .flip-card__front-side {
          transform: rotateX(180deg) translateZ(0);
          z-index: 10;
        }

        .flip-card.flipped.backward .flip-card__back-side {
          transform: rotateX(360deg) translateZ(0);
          z-index: 20;
        }

        @media (max-width: 768px) {
          .cards-container {
            flex-direction: column;
          }

          .cards-stack {
            position: relative;
            width: 100%;
            height: 40vh;
            margin-top: 2rem;
          }

          .text-blocks {
            padding-right: 0;
          }

          .text-block h2 {
            font-size: 2.5rem;
          }
        }
      `}</style>

            <style jsx global>{`
              @media (prefers-reduced-motion: no-preference) {
                .dashboard-image {
                  scale: 0.5;
                  opacity: 1;
                  animation: dashboard-fade-in linear both;
                  animation-timeline: view();
                  animation-range: entry 0% entry 100%;
                }
                @keyframes dashboard-fade-in {
                  from {
                    scale: 0.85;
                    opacity: 0.3;
                  }
                  to {
                    scale: 1;
                    opacity: 1;
                  }
                }
              }
            `}</style>
        </>
    )
}

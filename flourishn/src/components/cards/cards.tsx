"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
// import StatsSection from '../ui/StatsSection'
// FaqSection now rendered directly in page.tsx, see note near its old call site below
// import FaqSection from '../ui/FaqSection'
import IdeasNeedTeamsSection from '../ui/IdeasNeedTeamsSection'
import ScrollTextAnimation from '../ui/ScrollTextAnimation'

interface CardData {
    title: string
    text: string
    link: string
    image: string
    href?: string
}

const FLIP_HEIGHT = 270
const PAUSE_HEIGHT = 320
const PAUSE_FIRST_CARD = 2000
const MOBILE_BREAKPOINT = 1024

export default function ResponsiveCards() {
    const cardRef = useRef<HTMLDivElement>(null)
    const cardsSectionRef = useRef<HTMLDivElement>(null)
    const [stage, setStage] = useState(0)
    const [rotation, setRotation] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const textBlocksRef = useRef<(HTMLDivElement | null)[]>([])

    const cardData: CardData[] = [
        {
            title: "Turn your ideas into reality",
            text: "Whether you're a developer, designer, or innovator, our platform gives you the space to showcase your projects and connect with like-minded creators.",
            link: "Send us an idea",
            image: "/images/post-page-preview.png",
            href: "/post",
        },
        {
            title: "Every idea gets a real look",
            text: "Once you submit, it goes straight to our team, not a queue or an algorithm. We read the details, the ask, and how we can help before anything moves forward.",
            link: "Meet the team",
            image: "/images/idea-review.png",
            href: "/about",
        },
        {
            title: "We'll connect for feedback and funding",
            text: "If your idea is a fit, we'll reach out directly with feedback, and when it makes sense, help connect you with potential funding to take the next step.",
            link: "Contact us",
            image: "/images/connect-funding.png",
            href: "/contactUs",
        },
        // {
        //     title: "Everything you need,\nright where you code",
        //     text: "Thanks to an ecosystem of third-party extensions, Copilot Chat lets you check logs, toggle features, and deploy apps, without ever leaving your editor.",
        //     link: "Explore extensions",
        //     image: "/images/dashboard.png",
        // },
        // {
        //     title: "Discover ideas worth building",
        //     text: "Explore a growing collection of projects from creators across disciplines. Use smart filters and personalized recommendations to find ideas that spark your interest — and start collaborating right away.",
        //     link: "Search for projects",
        //     image: "/images/searchbar.png",
        // },
        // {
        //     title: "Grow your skills while you build",
        //     text: "hand-picked resources to help you learn the skills you need to contribute to the projects you care about — from coding to design to project management. Whether you're just starting out or leveling up, we've got you covered.",
        //     link: "Build your skills",
        //     image: "/images/learn.png",
        // }
    ]

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        // Only set up flip animation on desktop
        let scrollHandler: (() => void) | null = null
        
        if (!isMobile) {
            scrollHandler = () => {
                const scrollY = window.scrollY;
                if (scrollY < PAUSE_FIRST_CARD) {
                    setStage(0);
                    setRotation(0);
                    return;
                }
                const totalCards = cardData.length;
                const localScroll = scrollY - PAUSE_FIRST_CARD;
                let currentStage = Math.floor(localScroll / (FLIP_HEIGHT + PAUSE_HEIGHT));
                currentStage = Math.min(currentStage, totalCards - 2);
                currentStage = Math.max(currentStage, 0);
                const stageStart = currentStage * (FLIP_HEIGHT + PAUSE_HEIGHT);
                const stageProgress = (localScroll - stageStart) / FLIP_HEIGHT;
                const rotation = Math.min(Math.max(stageProgress * 180, 0), 180);
                setStage(currentStage);
                setRotation(rotation);
            };
            
            window.addEventListener("scroll", scrollHandler, { passive: true });
            scrollHandler();
        }

        return () => {
            if (scrollHandler) {
                window.removeEventListener("scroll", scrollHandler);
            }
        }
    }, [isMobile, cardData.length]);

    const front = cardData[stage]
    const back = cardData[stage + 1]

    return (
        <div className={`${isMobile ? 'min-h-[100vh]' : 'min-h-[2000px]'} relative cards-section w-full`}>

            {/* Ideas Need Teams Section */}
            <IdeasNeedTeamsSection />

            {/* Dashboard Image Section */}
            <div className="w-full flex justify-center items-center py-10 px-5 bg-white relative z-20">
                <div className="w-full max-w-6xl mx-auto flex justify-center relative">
                    <Image
                        src="/images/dashboard-preview.png"
                        alt="IdeaBoard Dashboard"
                        width={1000}
                        height={600}
                        className="dashboard-image w-full lg:w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl object-contain border-3 border-[#e2e5ea]"
                    />
                </div>
            </div>

            <div className="w-full h-16 lg:h-[4rem]" />

            {/* Desktop: Flipping Cards | Mobile: Stacked Cards */}
            <div className="h-10 lg:h-20"></div>
            <div className="relative w-full bg-white" ref={cardsSectionRef}>
                {/* Mobile Layout: Stacked cards */}
                <div className="block lg:hidden">
                    <div className="container mx-auto px-4 sm:px-8">
                        <div className="space-y-28 py-10">
                            {cardData.map((card, index) => (
                                <div key={index} className="mobile-card-block flex flex-col items-center gap-14 sm:gap-16">
                                    <div className="text-block text-center w-full">
                                        <h2 className="text-3xl sm:text-4xl leading-tight text-gray-900 whitespace-pre-line mb-4">
                                            {card.title}
                                        </h2>
                                        <p className="text-base sm:text-lg leading-relaxed text-gray-600 mb-4">
                                            {card.text}
                                        </p>
                                        <Link
                                            href={card.href || "#"}
                                            className="text-blue-400 no-underline text-base sm:text-lg inline-flex items-center justify-center hover:text-blue-300 transition-colors duration-200 group"
                                        >
                                            {card.link}
                                            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </Link>
                                    </div>
                                    <div className="card-image-container w-full flex justify-center">
                                        <div className="relative w-full aspect-[4/3] max-w-md mx-auto">
                                            <Image
                                                src={card.image}
                                                alt={card.title}
                                                fill
                                                className="object-cover rounded-2xl shadow-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Layout: Flip animation */}
                <div className="hidden lg:block w-full">
                    <div className="w-full max-w-[1400px] mx-auto px-8 xl:px-12">
                        <div className="grid grid-cols-2 gap-12 xl:gap-16 pt-80 pb-20">
                            {/* Text Block Column */}
                            <div className="space-y-32 flex flex-col items-end" style={{ marginLeft: 'clamp(2rem, 6vw, 4rem)' }}>
                                {cardData.map((card, index) => (
                                    <div
                                        key={index}
                                        ref={el => { textBlocksRef.current[index] = el; }}
                                        className="text-block min-h-[80vh] flex flex-col justify-center bg-white relative z-10 text-right w-full max-w-[500px]"
                                        id={`text-block-${index}`}
                                    >
                                        <h2 className="text-4xl xl:text-5xl leading-tight text-white whitespace-pre-line mb-6 text-right">
                                            {card.title}
                                        </h2>
                                        <p className="text-lg xl:text-xl leading-relaxed text-gray-400 mb-6 max-w-[500px] text-right">
                                            {card.text}
                                        </p>
                                        <Link
                                            href={card.href || "#"}
                                            className="text-blue-400 no-underline text-lg xl:text-xl inline-flex items-center hover:text-blue-300 transition-colors duration-200 group justify-start"
                                        >
                                            {card.link}
                                            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Card Image Column - Only visible on desktop */}
                            <div className="flex justify-center items-start" style={{ marginRight: 'clamp(2rem, 6vw, 5rem)' }}>
                                <div className="sticky top-32 h-[75vh] flex items-center justify-center w-full max-w-[550px] min-w-[400px]">
                                    <div className="perspective-1000 w-full h-auto aspect-[4/3] max-h-[450px]">
                                        <div
                                            ref={cardRef}
                                            className="relative w-full h-full"
                                            style={{
                                                transformStyle: "preserve-3d",
                                                transform: `rotateX(${rotation}deg)`,
                                                transition: "transform 0s",
                                            }}
                                        >
                                            {/* Front card */}
                                            <div
                                                className="absolute w-full h-full rounded-[35px] shadow-2xl backface-hidden overflow-hidden"
                                                style={{
                                                    transform: "translateZ(0)",
                                                }}
                                            >
                                                <Image
                                                    src={front.image}
                                                    alt={front.title}
                                                    fill
                                                    className="object-cover w-full h-full rounded-[35px]"
                                                />
                                            </div>
                                            {/* Back card */}
                                            {back && (
                                                <div
                                                    className="absolute w-full h-full rounded-[35px] shadow-2xl backface-hidden overflow-hidden"
                                                    style={{
                                                        transform: "rotateX(180deg) translateZ(0)",
                                                    }}
                                                >
                                                    <Image
                                                        src={back.image}
                                                        alt={back.title}
                                                        fill
                                                        className="object-cover w-full h-full rounded-[35px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer above Scroll Text Animation */}
            <div className="h-32 lg:h-48"></div>

            {/* Scroll Text Animation Section */}
            <ScrollTextAnimation />

            {/* Spacer below Scroll Text Animation */}
            <div className="h-32 lg:h-48"></div>

            {/* Spacer above Chatbot Section */}
            {/* <div className="h-16 lg:h-32"></div> */}

            {/* Chatbot Section */}
            {/* <div className="w-full flex justify-center items-center pb-10 px-5 bg-black relative z-20">
                <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center relative">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl leading-snug font-semibold text-white text-center mb-8 lg:mb-16 px-4">
                        Meet Flo — your personal idea partner
                    </h2>
                    <div className="w-full flex justify-center px-4">
                        <div className="w-full lg:w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl object-contain flex items-center justify-center">
                            <Image
                                src="/images/chatbot.png"
                                alt="Flo - Your Personal Idea Partner"
                                width={1000}
                                height={600}
                                className="w-full h-auto rounded-2xl object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div> */}

            {/* <div className="h-16 lg:h-64"></div>
            <StatsSection />
            <div className="h-16 lg:h-64"></div> */}

            {/* FaqSection moved out to page.tsx so the LifeOrbit spotlight section
                can sit between this component and the FAQ, instead of at the very
                bottom of the home page. */}
            {/* <FaqSection />
            <div className="h-8 lg:h-32"></div> */}

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                
                .backface-hidden {
                    backface-visibility: hidden;
                }
                
                /* Ensure text blocks are properly right-aligned on desktop only */
                /* This was previously unscoped and was forcing the mobile stacked
                   cards (which also use the .text-block class) to be right-aligned
                   too, breaking their left-to-right reading layout. */
                @media (min-width: 1024px) {
                    .text-block {
                        text-align: right !important;
                    }

                    .text-block h2,
                    .text-block p,
                    .text-block a {
                        text-align: right !important;
                    }
                }

                /* Responsive image container behavior */
                .cards-section {
                    --text-scale: 1;
                    --image-scale: 0.95;
                    --image-top-offset: 10rem;
                }
                
                @media (max-width: 1400px) {
                    .cards-section {
                        --text-scale: 0.99;
                        --image-scale: 0.85;
                        --image-top-offset: 12rem;
                    }

                    .cards-section .grid {
                        gap: 3.5rem !important;
                    }
                }

                @media (max-width: 1200px) {
                    .cards-section {
                        --text-scale: 0.95;
                        --image-scale: 0.75;
                        --image-top-offset: 14rem;
                    }

                    .cards-section .grid {
                        gap: 3rem !important;
                    }
                }

                @media (max-width: 1100px) {
                    .cards-section {
                        --text-scale: 0.9;
                        --image-scale: 0.65;
                        --image-top-offset: 16rem;
                    }

                    .cards-section .grid {
                        gap: 3rem !important;
                    }
                }
                
                @media (max-width: 1024px) {
                    .cards-section .hidden.lg\\:block {
                        display: none !important;
                    }
                }
                
                /* Apply scaling to text elements - only when scaling is active */
                @media (max-width: 1400px) {
                    .cards-section .text-block h2 {
                        font-size: calc(2.25rem * var(--text-scale)) !important;
                        line-height: calc(2.5rem * var(--text-scale)) !important;
                    }
                    
                    .cards-section .text-block p {
                        font-size: calc(1.125rem * var(--text-scale)) !important;
                        line-height: calc(1.625rem * var(--text-scale)) !important;
                    }
                    
                    .cards-section .text-block a {
                        font-size: calc(1.125rem * var(--text-scale)) !important;
                    }
                }
                
                /* Apply scaling to image container and fix positioning */
                .cards-section .max-w-\[550px\] {
                    max-width: calc(550px * var(--image-scale)) !important;
                }
                
                .cards-section .h-\[75vh\] {
                    height: calc(75vh * var(--image-scale)) !important;
                }
                
                .cards-section .sticky {
                    top: var(--image-top-offset) !important;
                }
                
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
                    
                    /* Desktop-only: the mobile stacked cards use this same .text-block
                       class, and already get their own reveal animation from
                       .mobile-card-block below — giving it a second, independently
                       scroll-linked fade here caused the two to fight and flicker. */
                    @media (min-width: 1024px) {
                        .text-block {
                            opacity: 0;
                            animation: text-fade-in linear forwards;
                            animation-timeline: view();
                            animation-range: entry 300px;
                        }
                    }

                    @keyframes text-fade-in {
                        to {
                            opacity: 1;
                        }
                    }

                    /* Mobile card animations */
                    @media (max-width: 1023px) {
                        .mobile-card-block {
                            opacity: 0;
                            transform: translateY(20px);
                            animation: mobile-fade-in 0.6s ease-out forwards;
                            animation-timeline: view();
                            animation-range: entry 10% cover 30%;
                        }

                        @keyframes mobile-fade-in {
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    }
                }
            `}</style>
        </div>
    )
}
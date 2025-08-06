"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import StatsSection from '../ui/StatsSection'
import FaqSection from '../ui/FaqSection'

interface CardData {
    title: string
    text: string
    link: string
    image: string
}

const FLIP_HEIGHT = 270 // px for each flip (slower flip)
const PAUSE_HEIGHT = 320 // px for pause between flips
const PAUSE_FIRST_CARD = 2000; // px to pause on the first card

export default function Cards() {
    const cardRef = useRef<HTMLDivElement>(null)
    const cardsSectionRef = useRef<HTMLDivElement>(null)
    const [stage, setStage] = useState(0) // which flip we're on
    const [rotation, setRotation] = useState(0)
    const textBlocksRef = useRef<(HTMLDivElement | null)[]>([])
    const wordsRef = useRef<(HTMLSpanElement | null)[]>([])

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
        }
    ]

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        // Get all word elements
        const words = document.querySelectorAll('.word')
        wordsRef.current = Array.from(words) as HTMLSpanElement[]

        // Create scroll trigger for text animation
        ScrollTrigger.create({
            trigger: ".text-4xl",
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
                            word.style.color = "#374151" // text-gray-700
                        }
                    }
                })
            }
        })

        const handleScroll = () => {
            const scrollY = window.scrollY;
            console.log(`Scrolled: ${scrollY}px`);
            if (scrollY < PAUSE_FIRST_CARD) {
                setStage(0);
                setRotation(0);
                console.log(`Card flip stage: 0, rotation: 0 (First card paused)`);
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
            console.log(`Card flip stage: ${currentStage}, rotation: ${rotation}`);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Get the current front and back cards based on stage
    const front = cardData[stage]
    const back = cardData[stage + 1]

    return (
        <div className="min-h-[2000px] relative cards-section">
            {/* Animated Text Section */}
            <div className="w-full flex justify-center items-center bg-black relative z-20" style={{ minHeight: '0', paddingTop: '11rem', paddingBottom: '11rem' }}>
                {/* To adjust line breaks, tweak the maxWidth value below (e.g., 700px for 2 lines) */}
                <div className="w-full mx-auto text-center flex flex-col justify-center" style={{ maxWidth: '900px' }}>
                    <div className="text-4xl md:text-5xl leading-snug font-semibold">
                        <span className="word transition-colors duration-300 text-gray-700">Ideas</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">need</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">teams.</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">We</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">make</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">that</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">easy.</span>
                        <br />
                        <span className="word transition-colors duration-300 text-gray-700">At</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">Flourish,</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">projects</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">find</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">their</span>{" "}
                        <span className="word transition-colors duration-300 text-gray-700">people.</span>
                    </div>
                </div>
            </div>
            {/* Dashboard Image Section */}
            <div className="w-full flex justify-center items-center py-10 px-5 bg-black relative z-20">
                <div className="w-full max-w-6xl mx-0 flex justify-center relative">
                    <Image
                        src="/images/dashboard2.png"
                        alt="IdeaBoard Dashboard"
                        width={1000}
                        height={600}
                        className="dashboard-image w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl object-contain border-3 border-[#2f3542]"
                    />
                </div>
            </div>
            {/* Spacer to move cards further down */}
            <div className="w-full h-[4rem]" />

            {/* Flipping Cards Section */}
            {/* Spacer to move cards section down */}
            <div className="h-20"></div>
            <div className="relative w-full bg-black" ref={cardsSectionRef}>
                <div className="container mx-auto px-12 md:px-20">
                    <div className="flex">
                        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 pt-80 pb-20 justify-center">
                            {/* Spacer Column for left margin on large screens */}
                            <div className="hidden lg:block" style={{ minWidth: '650px' }}></div>
                            {/* Text Block Column */}
                            <div className="space-y-32">
                                {cardData.map((card, index) => (
                                    <div
                                        key={index}
                                        ref={el => { textBlocksRef.current[index] = el; }}
                                        className="text-block min-h-[80vh] min-w-[70vh] flex flex-col justify-center bg-black relative z-10 text-left"
                                        id={`text-block-${index}`}
                                    >
                                        <h2 className="text-5xl leading-tight text-white whitespace-pre-line" style={{ marginBottom: '1rem' }}>{card.title}</h2>
                                        <p className="text-lg leading-relaxed text-gray-400 max-w-lg" style={{ marginBottom: '1rem' }}>{card.text}</p>
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

                            {/* Spacer Column for right margin on large screens */}
                            <div className="hidden lg:block" style={{ minWidth: '10px' }}></div>
                            {/* Card Image Column */}
                            <div className="flex-1 flex justify-end">
                                <div className="sticky top-24 h-[80vh] flex items-center justify-center ml-80 min-w-[80vh] max-w-[85vh]">
                                    <div className="perspective-1000 w-full h-[50vh]">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Spacer Column for right margin on large screens */}
                            <div className="hidden lg:block" style={{ minWidth: '60px' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer above Chatbot Section */}
            <div style={{ height: '8rem' }}></div>
            {/* Chatbot Section */}
            <div className="w-full flex justify-center items-center pb-10 px-5 bg-black relative z-20">
                <div className="w-full max-w-6xl mx-0 flex flex-col justify-center items-center relative">
                    <h2 className="text-4xl md:text-5xl leading-snug font-semibold text-white text-center mb-64">Meet Flo — your personal idea partner</h2>
                    <div className="w-full flex justify-center">
                        <div className="w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl object-contain mt-64 flex items-center justify-center" style={{ minHeight: '400px' }}>
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
            </div>
            <div style={{ height: '16rem' }}></div>
            <StatsSection />
            <div style={{ height: '16rem' }}></div>
            <FaqSection />
            <div style={{ height: '8rem' }}></div>

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
                .text-block {
                    opacity: 0;
                    animation: text-fade-in linear forwards;
                    animation-timeline: view();
                    animation-range: entry 300px;
                }
                @keyframes text-fade-in {
                    to {
                        opacity: 1;
                    }
                }
                }
                `}</style>
        </div>
    )
}
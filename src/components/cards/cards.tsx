"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface CardData {
    title: string
    text: string
    link: string
    image: string
}

const FLIP_HEIGHT = 180 // px for each flip
const PAUSE_HEIGHT = 300 // px for pause between flips
const PAUSE_FIRST_CARD = 2000; // px to pause on the first card

export default function Cards() {
    const cardRef = useRef<HTMLDivElement>(null)
    const cardsSectionRef = useRef<HTMLDivElement>(null)
    const [stage, setStage] = useState(0) // which flip we're on
    const [rotation, setRotation] = useState(0)
    const textBlocksRef = useRef<(HTMLDivElement | null)[]>([])

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

    useEffect(() => {
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
        <div className="min-h-[2000px] relative card-section"> {/* Added card-section class */}
            {/* Dashboard Image Section */}
            <div className="w-full flex justify-center items-center py-10 px-5 bg-black relative z-20">
                <div className="w-full max-w-6xl mx-0 flex justify-center relative">
                    <Image
                        src="/images/dashboard1.png"
                        alt="IdeaBoard Dashboard"
                        width={1000}
                        height={600}
                        className="dashboard-image w-[90%] max-w-4xl h-auto rounded-2xl shadow-2xl object-contain"
                    />
                </div>
            </div>
            {/* Spacer to move cards further down */}
            <div className="w-full h-[20rem]" />

            {/* Flipping Cards Section */}
            <div className="w-full flex justify-center" ref={cardsSectionRef}>
                <div className="flex relative p-8 bg-black pb-40 w-full max-w-6xl">
                    {/* Text Block Column */}
                    <div className="flex-1 max-w-2xl pr-8 bg-black pl-8 pb-8">
                        {cardData.map((card, index) => (
                            <div
                                key={index}
                                ref={el => { textBlocksRef.current[index] = el; }}
                                className="homepage-card-text min-h-screen flex flex-col justify-center p-8 mb-16 bg-black transform translate-y-12 transition-transform duration-700 relative z-10"
                                id={`text-block-${index}`}
                            >
                                <h2 className="!font-bold !text-[3rem] !leading-tight !mb-6 !text-white !text-left">{card.title}</h2>
                                <p className="!text-lg !leading-relaxed !mb-8 !text-gray-400 !text-left">{card.text}</p>
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
                    <div className="sticky top-32 w-[38vw] h-[52vh] flex justify-center items-center right-8 mr-20">
                        <div
                            ref={cardRef}
                            className="relative w-full h-full perspective-1000"
                            style={{
                                transformStyle: "preserve-3d",
                                transform: `rotateX(${rotation}deg)`,
                                transition: "transform 0s",
                            }}
                        >
                            {/* Front card */}
                            <div className="absolute w-full h-full rounded-[35px] shadow-2xl backface-hidden overflow-hidden">
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
                                    transform: "rotateX(180deg)",
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
        </div>
    )
}


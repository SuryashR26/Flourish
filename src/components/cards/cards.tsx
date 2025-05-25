"use client";

import React, { useEffect, useRef, useState } from 'react';

interface CardData {
    title: string;
    text: string;
    link: string;
    image: string;
}

const cardData: CardData[] = [
    {
        title: "Everything you need,\nright where you code",
        text: "Thanks to an ecosystem of third-party extensions, Copilot Chat lets you check logs, toggle features, and deploy apps, without ever leaving your editor.",
        link: "Explore extensions",
        image: "/Images/dashboard.png",
    },
    {
        title: "Turn your ideas into reality",
        text: "Whether you're a developer, designer, or innovator, our platform gives you the space to showcase your projects and connect with like-minded creators.",
        link: "View projects",
        image: "/Images/post.png",
    },
    {
        title: "Discover ideas worth building",
        text: "Explore a growing collection of projects from creators across disciplines. Use smart filters and personalized recommendations to find ideas that spark your interest — and start collaborating right away.",
        link: "Search for projects",
        image: "/Images/searchbar.png",
    },
    {
        title: "Grow your skills while you build",
        text: "hand-picked resources to help you learn the skills you need to contribute to the projects you care about — from coding to design to project management. Whether you're just starting out or leveling up, we've got you covered.",
        link: "Build your skills",
        image: "/Images/learn.png",
    },
    {
        title: "Meet Flo — your personal idea partner",
        text: "Need help putting thoughts into words? Flo's here to brainstorm with you, clean up your writing, and suggest ways to take your project to the next level. Always ready. Always on your side.",
        link: "Talk to Flo",
        image: "/Images/chatbot.png",
    },
];

const Cards: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
    const [noTransition, setNoTransition] = useState(false);
    const [isScrollingFast, setIsScrollingFast] = useState(false);

    const textBlocksRef = useRef<(HTMLDivElement | null)[]>([]);
    const lastScrollTime = useRef(Date.now());
    const scrollTimeout = useRef<number | null>(null);

    const activeIndexRef = useRef(activeIndex);
    const isAnimatingRef = useRef(isAnimating);
    const flipDirectionRef = useRef(flipDirection);

    useEffect(() => {
        textBlocksRef.current = Array(cardData.length).fill(null);
    }, []);

    useEffect(() => {
        activeIndexRef.current = activeIndex;
        isAnimatingRef.current = isAnimating;
    }, [activeIndex, isAnimating]);

    useEffect(() => {
        flipDirectionRef.current = flipDirection;
    }, [flipDirection]);

    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            const timeSinceLastScroll = now - lastScrollTime.current;
            lastScrollTime.current = now;

            if (timeSinceLastScroll < 100) {
                setIsScrollingFast(true);
                if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                scrollTimeout.current = window.setTimeout(() => {
                    setIsScrollingFast(false);
                }, 500);
            }

            if (window.scrollY <= 5) {
                setNoTransition(true);
                setActiveIndex(0);
                setNextIndex(0);
                setIsFlipped(false);
                isAnimatingRef.current = false;
                setIsAnimating(false);
                requestAnimationFrame(() => setNoTransition(false));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    const handleCardChange = (newIndex: number) => {
        if (isAnimatingRef.current) return;

        if (isScrollingFast) {
            setNoTransition(true);
            setActiveIndex(newIndex);
            setNextIndex(newIndex);
            setIsFlipped(false);
            isAnimatingRef.current = false;
            setIsAnimating(false);
            requestAnimationFrame(() => setNoTransition(false));
            return;
        }

        isAnimatingRef.current = true;
        setIsAnimating(true);
        setNoTransition(false);
        setNextIndex(newIndex);
        setIsFlipped(true);
    };

    useEffect(() => {
        const card = document.querySelector('.flip-card');
        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'transform') return;

            if (isFlipped) {
                setActiveIndex(nextIndex);
                setNoTransition(true);

                requestAnimationFrame(() => {
                    setIsFlipped(false);

                    requestAnimationFrame(() => {
                        setNoTransition(false);
                        isAnimatingRef.current = false;
                        setIsAnimating(false);
                    });
                });
            }
        };

        // ✅ TypeScript fix applied here
        card?.addEventListener('transitionend', handleTransitionEnd as EventListener);
        return () => {
            card?.removeEventListener('transitionend', handleTransitionEnd as EventListener);
        };
    }, [isFlipped, nextIndex]);

    useEffect(() => {
        const handleScroll = () => {
            const now = Date.now();
            lastScrollTime.current = now;

            const blockPositions = textBlocksRef.current.map((el, index) => {
                const rect = el?.getBoundingClientRect();
                return {
                    index,
                    top: rect?.top ?? 0,
                    bottom: rect?.bottom ?? 0,
                    height: rect?.height ?? 0,
                };
            });

            const mostVisibleBlock = blockPositions.reduce((prev, current) => {
                const prevVisibility = Math.min(prev.bottom, window.innerHeight) - Math.max(prev.top, 0);
                const currentVisibility = Math.min(current.bottom, window.innerHeight) - Math.max(current.top, 0);
                return currentVisibility > prevVisibility ? current : prev;
            });

            if (window.scrollY <= 5) {
                updateCardState(0);
            } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
                updateCardState(blockPositions.length - 1);
            } else {
                updateCardState(mostVisibleBlock.index);
            }
        };

        const updateCardState = (newIndex: number) => {
            if (newIndex === activeIndexRef.current || isAnimatingRef.current) return;

            setNoTransition(true);
            setActiveIndex(newIndex);
            setNextIndex(newIndex);
            setIsFlipped(false);
            isAnimatingRef.current = false;
            setIsAnimating(false);
            requestAnimationFrame(() => {
                setNoTransition(false);
            });
        };

        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll);
        return () => {
            window.removeEventListener('scroll', throttledScroll);
        };
    }, []);

    useEffect(() => {
        const cardObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = textBlocksRef.current.indexOf(entry.target as HTMLDivElement);
                    if (idx === -1) return;

                    if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                        if (idx === activeIndexRef.current || isAnimatingRef.current) return;
                        const isScrollingDown = idx > activeIndexRef.current;
                        setTimeout(() => {
                            setFlipDirection(isScrollingDown ? 'forward' : 'backward');
                            handleCardChange(idx);
                        }, 50);
                    }
                });
            },
            {
                root: null,
                rootMargin: '-40% 0px -20% 0px',
                threshold: [0.3, 0.5, 0.7],
            }
        );

        const textObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        textBlocksRef.current.forEach((el) => {
            if (el) {
                cardObserver.observe(el);
                textObserver.observe(el);
            }
        });

        return () => {
            cardObserver.disconnect();
            textObserver.disconnect();
        };
    }, []);

    return (
        <>
            <section className="dashboard-section w-full min-h-screen flex justify-center items-center p-5 bg-black relative z-20">
                <div className="dashboard-container max-w-[1200px] w-full flex justify-center relative">
                    <img
                        src="/Images/dashboard1.png"
                        alt="IdeaBoard Dashboard"
                        className="w-full object-contain"
                    />
                </div>
            </section>
        </>
    );
};

export default Cards;

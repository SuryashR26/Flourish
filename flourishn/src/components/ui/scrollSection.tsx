import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

const CollaborationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <circle cx="9" cy="8" r="3.2" stroke="#1f98f4" strokeWidth="1.8" />
        <circle cx="16" cy="9" r="2.6" stroke="#1f98f4" strokeWidth="1.8" />
        <path d="M3.5 20c0-3.5 2.8-5.5 5.5-5.5s5.5 2 5.5 5.5" stroke="#1f98f4" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14.5 20c0-2.6 1.6-4.4 3.8-4.7" stroke="#1f98f4" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
)

const CuriosityIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.45 1 1.15 1 1.9V16h5v-.2c0-.75.4-1.45 1-1.9A6 6 0 0012 3Z" stroke="#1f98f4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const GrowthIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
        <path d="M12 21V10" stroke="#1f98f4" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 13c0 0-6 0-6-6c6 0 6 6 6 6Z" stroke="#1f98f4" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 10c0 0 5-1 5-6c-5 0-5 5-5 6Z" stroke="#1f98f4" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
)

const coreValues = [
    {
        title: "Collaboration",
        text: "Our mission is to provide a platform that enables individuals and teams to find each other and build together.",
        icon: CollaborationIcon,
        image: "/images/value-collaboration.png",
    },
    {
        title: "Curiosity",
        text: "We believe in fostering creativity and innovation. Asking \"what if\" is how every idea on Flourish gets its start.",
        icon: CuriosityIcon,
        image: "/images/value-curiosity.png",
    },
    {
        title: "Growth",
        text: "By providing the right tools and resources, we help transform ideas into reality, no matter how big or small they may be.",
        icon: GrowthIcon,
        image: "/images/value-growth.png",
    },
]

function ScrollSection() {
    const sectionsRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    gsap.registerPlugin(ScrollTrigger);

    useEffect(() => {
        // The horizontal pin-scroll carousel is desktop-only (matches the lg
        // breakpoint used elsewhere). On small screens it was clipping the
        // icon/image content, which doesn't fit the fixed vh-based panel
        // height once text+image stack vertically — so below lg we render a
        // plain vertical list instead (see JSX) and skip the pin entirely.
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            const pin = gsap.fromTo(sectionsRef.current, {
                translateX: 0,
            }, {
                translateX: "-200vw",
                ease: "none",
                duration: 1,
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: "+=2000",
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1
                }
            });

            return () => {
                pin.kill();
            };
        });

        return () => mm.revert();
    }, []);

    return (
        <section className="overflow-hidden relative bg-white">
            <div ref={triggerRef} className="relative">
                {/* Single sticky header on desktop; normal in-flow heading on mobile */}
                <h1 className="static mb-10 lg:absolute lg:mb-0 lg:top-8 lg:inset-x-0 text-center text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 z-50 pt-16 lg:pt-0">
                    Our Core Values
                </h1>

                <div ref={sectionsRef} className="h-auto lg:h-[80vh] w-full lg:w-[300vw] flex flex-col lg:flex-row gap-20 lg:gap-0 relative pb-20 lg:pb-0">
                    {coreValues.map((value) => {
                        const Icon = value.icon
                        return (
                            <div key={value.title} className="h-auto lg:h-full w-full lg:w-screen relative flex items-center justify-center px-6 md:px-12">
                                <div className="flex flex-col items-center w-full max-w-4xl p-8 md:p-12">
                                    <div className="w-16 h-16 rounded-full bg-[#e8f3fe] flex items-center justify-center">
                                        <Icon />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-6 text-center">
                                        {value.title}
                                    </h2>
                                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 mt-10 w-full">
                                        <p className="text-base md:text-lg text-gray-600 leading-relaxed text-center md:text-left flex-1 order-2 md:order-1">
                                            {value.text}
                                        </p>
                                        <div className="relative w-full max-w-xs md:max-w-[280px] aspect-4/3 flex-shrink-0 order-1 md:order-2">
                                            <Image
                                                src={value.image}
                                                alt={value.title}
                                                fill
                                                className="object-cover rounded-2xl shadow-xl"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}

export default ScrollSection;
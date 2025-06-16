import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { FaHeart } from "react-icons/fa";
import Image from "next/image";

function ScrollSection() {
    const sectionsRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    gsap.registerPlugin(ScrollTrigger);

    useEffect(() => {
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
            ScrollTrigger.getAll().forEach(t => t.kill());
        }
    }, []);

    return (
        <section className="overflow-hidden relative bg-black">
            <div ref={triggerRef} className="relative">
                {/* Single sticky header */}
                <h1 className="absolute top-8 left-40 text-2xl md:text-3xl lg:text-4xl font-bold text-white z-50 ml-4 md:ml-8 lg:ml-10">
                    Our Core Values
                </h1>

                <div ref={sectionsRef} className="h-[70vh] md:h-[75vh] lg:h-[80vh] w-[300vw] flex flex-row relative">
                    {/* First Section */}
                    <div className="h-full w-screen relative">
                        <div className="h-full flex flex-col md:flex-row items-center justify-center px-4 md:px-8 lg:px-32 gap-6 md:gap-8 lg:gap-12">
                            <div className="flex flex-col justify-center w-full md:w-1/2 lg:w-1/2 space-y-4">
                                <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 lg:mb-8 text-left" />
                                <p className="text-lg md:text-xl lg:text-2xl text-left text-white leading-relaxed">
                                    Our mission is to provide a platform that enables individuals and teams to collaborate, innovate.
                                </p>
                            </div>
                            <div className="relative w-[180px] h-[135px] sm:w-[200px] sm:h-[150px] md:w-[220px] md:h-[165px] lg:w-[280px] lg:h-[190px] mt-4 md:mt-0">
                                <Image
                                    src="/images/ideaG.jpg"
                                    alt="Vision Background"
                                    fill
                                    className="object-cover rounded-lg"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Second Section */}
                    <div className="h-full w-screen relative">
                        <div className="h-full flex flex-col md:flex-row items-center justify-center px-4 md:px-8 lg:px-32 gap-6 md:gap-8 lg:gap-12">
                            <div className="flex flex-col justify-center w-full md:w-1/2 lg:w-1/2 space-y-4">
                                <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 lg:mb-8 text-left" />
                                <p className="text-lg md:text-xl lg:text-2xl text-left text-white leading-relaxed">
                                    We believe in fostering creativity and innovation through collaboration and community support.
                                </p>
                            </div>
                            <div className="relative w-[180px] h-[135px] sm:w-[200px] sm:h-[150px] md:w-[220px] md:h-[165px] lg:w-[280px] lg:h-[190px] mt-4 md:mt-0">
                                <Image
                                    src="/images/ideaG.jpg"
                                    alt="Vision Background"
                                    fill
                                    className="object-cover rounded-lg"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Third Section */}
                    <div className="h-full w-screen relative">
                        <div className="h-full flex flex-col md:flex-row items-center justify-center px-4 md:px-8 lg:px-32 gap-6 md:gap-8 lg:gap-12">
                            <div className="flex flex-col justify-center w-full md:w-1/2 lg:w-1/2 space-y-4">
                                <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 lg:mb-8 text-left" />
                                <p className="text-lg md:text-xl lg:text-2xl text-left text-white leading-relaxed">
                                    By providing the right tools and resources, we help transform ideas into reality, no matter how big or small they may be.
                                </p>
                            </div>
                            <div className="relative w-[180px] h-[135px] sm:w-[200px] sm:h-[150px] md:w-[220px] md:h-[165px] lg:w-[280px] lg:h-[190px] mt-4 md:mt-0">
                                <Image
                                    src="/images/ideaG.jpg"
                                    alt="Vision Background"
                                    fill
                                    className="object-cover rounded-lg"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ScrollSection;
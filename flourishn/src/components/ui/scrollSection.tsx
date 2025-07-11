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
                <h1 className="absolute top-8 inset-x-0 text-center text-2xl md:text-3xl lg:text-4xl font-bold text-white z-50">
                    Our Core Values
                </h1>

                <div ref={sectionsRef} className="h-[70vh] md:h-[75vh] lg:h-[80vh] w-[300vw] flex flex-row relative">
                    {/* First Section */}
                    <div className="h-full w-screen relative flex items-center justify-center px-12">
                        <div className="flex flex-col md:flex-row items-center justify-center rounded-2xl w-full max-w-5xl p-8 md:p-20">
                            <div className="w-full md:w-3/5">
                                <div className="flex flex-col space-y-8">
                                    <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl" />
                                    <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                        Our mission is to provide a platform that enables individuals and teams to collaborate, innovate.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-2/5 md:pl-20">
                                <div className="relative w-full aspect-4/3">
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

                    {/* Second Section */}
                    <div className="h-full w-screen relative flex items-center justify-center px-12">
                        <div className="flex flex-col md:flex-row items-center justify-center rounded-2xl w-full max-w-5xl p-8 md:p-20">
                            <div className="w-full md:w-3/5">
                                <div className="flex flex-col space-y-8">
                                    <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl" />
                                    <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                        We believe in fostering creativity and innovation through collaboration and community support.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-2/5 md:pl-20">
                                <div className="relative w-full aspect-4/3">
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

                    {/* Third Section */}
                    <div className="h-full w-screen relative flex items-center justify-center px-12">
                        <div className="flex flex-col md:flex-row items-center justify-center rounded-2xl w-full max-w-5xl p-8 md:p-20">
                            <div className="w-full md:w-3/5">
                                <div className="flex flex-col space-y-8">
                                    <FaHeart className="text-[#1f98f4] text-6xl md:text-7xl lg:text-8xl" />
                                    <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                        By providing the right tools and resources, we help transform ideas into reality, no matter how big or small they may be.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-2/5 md:pl-20">
                                <div className="relative w-full aspect-4/3">
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
            </div>
        </section>
    );
}

export default ScrollSection;
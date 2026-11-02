"use client";
import React from 'react'
import Navbar from '@/components/layout/navbar'
import Image from 'next/image'
import ScrollSection from '@/components/ui/scrollSection';
import AnimatedStars from '@/components/ui/AnimatedStars';
import ScrollLine from '@/components/ui/ScrollLine';

function page() {
    return (
        <div className="relative min-h-screen bg-white">
            <AnimatedStars />
            <div className="relative z-10">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-3xl text-gray-900 leading-relaxed mt-[15vh] md:mt-[20vh] lg:mt-[25vh] mb-[10vh] md:mb-[15vh] lg:mb-[20vh]">
                        Welcome! We are dedicated to providing the best service possible. Our team is passionate about what we do and we strive to exceed your expectations.
                    </h1>
                </div>
            </div>

            {/* Vision Section */}
            <div className="relative bg-white mb-10 md:mb-20 lg:mb-30 -mt-2 md:-mt-4 lg:-mt-6">
                <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                    <div style={{ position: "relative", width: "100%", height: 0 }}>
                        <ScrollLine />
                    </div>
                    <h2 className="text-2xl !mb-16 md:text-3xl lg:text-4xl text-center max-w-2xl text-gray-900 leading-relaxed mb-[5vh] md:mb-[7vh] lg:mb-[10vh]">
                        Our Vision
                    </h2>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full gap-8 lg:gap-12">
                        <div className="lg:flex-[1.3] w-full max-w-4xl mx-auto text-center lg:text-left vision-text flex flex-col gap-4 md:gap-5 lg:gap-6">
                            <h2 className="text-4xl md:text-4xl font-semibold text-gray-900">We Want Every Idea to Flourish</h2>
                            <p className="text-base md:text-lg lg:text-xl text-gray-900 leading-relaxed font-light">
                                We envision a world where ideas flourish freely, where the right tools and a supportive community help you turn any idea, big or small, into reality.
                            </p>
                        </div>
                        <div className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] lg:shrink-0 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] relative mt-8 lg:mt-0">
                            <Image
                                src="/images/vision-flourish.png"
                                alt="Vision Image"
                                width={600}
                                height={400}
                                className="w-full h-full rounded-lg shadow-lg object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ScrollSection />

            {/* Team Section */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 md:px-12 lg:px-32 bg-white pt-32 md:pt-24 lg:pt-20">
                <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-2xl text-gray-900 leading-relaxed !mb-16">
                    About Our Founder
                </h1>
                <div className="flex flex-row flex-wrap justify-center items-stretch gap-16 w-full max-w-7xl">
                    {/* First Team Member */}
                    <div className="flex flex-col items-center px-10 py-10 rounded-xl shadow-[0_4px_24px_rgba(20,23,28,0.08)] w-full sm:w-[400px] backdrop-blur-sm border-2 border-[#e2e5ea]">
                        <Image
                            src="/images/solo_pic.jpg"
                            alt="Suryash Rawat"
                            width={200}
                            height={200}
                            className="w-28 h-28 rounded-full mb-5 object-cover object-[center_12%]"
                        />
                        <h2 className="text-2xl text-gray-900 mb-2 font-semibold">Suryash Rawat</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-4">Founder</p>
                        <p className="text-gray-600 text-center text-base leading-relaxed">
                            An ambitious, business-minded builder who thrives on turning bold ideas into real products. Driven, resourceful, and always looking for the next problem worth solving.
                        </p>
                    </div>

                    {/* Second Team Member — commented out, only one team member for now */}
                    {/* <div
                        className="flex flex-col items-center px-8 pb-8 rounded-xl shadow-[0_4px_24px_rgba(20,23,28,0.08)] w-full sm:w-[450px] md:w-[500px] lg:w-[550px] min-h-[350px] backdrop-blur-sm border-2 border-[#e2e5ea] mt-10"
                        style={{ paddingTop: '1.5rem' }}
                    >
                        <Image
                            src="/images/ideaG.jpg"
                            alt="Team Member 2"
                            width={400}
                            height={400}
                            className="w-40 h-40 rounded-full mb-6 object-cover"
                        />
                        <h2 className="text-2xl text-gray-900 mb-3 font-semibold mt-4">Jane Smith</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-6">CTO</p>
                        <p className="text-gray-600 text-center text-base leading-relaxed max-h-[200px] overflow-y-auto px-4">
                            Driving technical innovation and product development with expertise in scalable solutions and emerging technologies.
                        </p>
                    </div> */}
                </div>
            </div>

            <style jsx global>{`
@media (prefers-reduced-motion: no-preference) {
.vision-text {
opacity: 0;
animation: vision-fade-in linear forwards;
animation-timeline: view();
animation-range: entry 100px;
}
@keyframes vision-fade-in {
to {
opacity: 1;
}
}
}
/* Force font-weight: 400 for paragraphs in vision-text, overriding global styles */
.vision-text p {
font-weight: 400 !important;
font-size: 1.2rem !important;
}
`}</style>
        </div>
    )
}

export default page;

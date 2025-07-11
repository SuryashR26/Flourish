"use client";
import React from 'react'
import Navbar from '@/components/layout/navbar'
import Image from 'next/image'
import ScrollSection from '@/components/ui/scrollSection';
import AnimatedStars from '@/components/ui/AnimatedStars';
import ScrollLine from '@/components/ui/ScrollLine';

function page() {
    return (
        <div className="relative min-h-screen bg-black">
            <AnimatedStars />
            <div className="relative z-10">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-3xl text-white leading-relaxed mt-[15vh] md:mt-[20vh] lg:mt-[25vh] mb-[10vh] md:mb-[15vh] lg:mb-[20vh]">
                        Welcome to our website! We are dedicated to providing the best service possible. Our team is passionate about what we do and we strive to exceed your expectations.
                    </h1>
                </div>
            </div>

            {/* Vision Section */}
            <div className="relative bg-black mb-10 md:mb-20 lg:mb-30 -mt-10 md:-mt-20 lg:-mt-30">
                <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                    <div style={{ position: "relative", width: "100%", height: 0 }}>
                        <ScrollLine />
                    </div>
                    <h2 className="text-2xl !mb-16 md:text-3xl lg:text-4xl text-center max-w-2xl text-white leading-relaxed mb-[5vh] md:mb-[7vh] lg:mb-[10vh]">
                        Our Vision
                    </h2>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full lg:w-4/5 gap-8 lg:gap-12">
                        <div className="flex-1 w-full max-w-4xl mx-auto text-center lg:text-left vision-text mt-32">
                            <h2 className="text-4xl md:text-4xl font-semibold text-white">We Want Every Idea to Flourish</h2>
                            <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed font-light mt-8">
                                We envision a world where ideas can flourish freely, fostering innovation and creativity. Our mission is to create a platform that empowers individuals and teams to bring their ideas to life. We believe in the power of collaboration and the importance of a supportive community. By providing the right tools and resources, we aim to help you transform your ideas into reality, no matter how big or small they may be.
                            </p>
                        </div>
                        <div className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] relative mt-8 lg:mt-0">
                            <Image
                                src="/Images/ideaG.jpg"
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
            <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 md:px-12 lg:px-32 bg-black pt-20">
                <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-2xl text-white leading-relaxed !mb-16">
                    Meet our Team
                </h1>
                <div className="flex flex-row flex-wrap justify-center items-stretch gap-16 w-full max-w-7xl">
                    {/* First Team Member */}
                    <div
                        className="flex flex-col items-center px-8 pb-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-[450px] md:w-[500px] lg:w-[550px] min-h-[350px] backdrop-blur-sm border-2 border-[#2f3542] mt-10"
                        style={{ paddingTop: '1.5rem' }}
                    >
                        <Image
                            src="/Images/ideaG.jpg"
                            alt="Team Member 1"
                            width={400}
                            height={400}
                            className="w-40 h-40 rounded-full mb-6 object-cover"
                        />
                        <h2 className="text-2xl text-white mb-3 font-semibold mt-4">John Doe</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-6">Founder & CEO</p>
                        <p className="text-gray-400 text-center text-base leading-relaxed max-h-[200px] overflow-y-auto px-4">
                            Leading the vision and strategy of our company with over 10 years of experience in technology and innovation.
                        </p>
                    </div>

                    {/* Second Team Member */}
                    <div
                        className="flex flex-col items-center px-8 pb-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-[450px] md:w-[500px] lg:w-[550px] min-h-[350px] backdrop-blur-sm border-2 border-[#2f3542] mt-10"
                        style={{ paddingTop: '1.5rem' }}
                    >
                        <Image
                            src="/Images/ideaG.jpg"
                            alt="Team Member 2"
                            width={400}
                            height={400}
                            className="w-40 h-40 rounded-full mb-6 object-cover"
                        />
                        <h2 className="text-2xl text-white mb-3 font-semibold mt-4">Jane Smith</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-6">CTO</p>
                        <p className="text-gray-400 text-center text-base leading-relaxed max-h-[200px] overflow-y-auto px-4">
                            Driving technical innovation and product development with expertise in scalable solutions and emerging technologies.
                        </p>
                    </div>
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

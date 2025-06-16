"use client";
import React from 'react'
import Navbar from '@/components/layout/navbar'
import Image from 'next/image'
import ScrollSection from '@/components/ui/scrollSection';

function page() {
    return (
        <div className="relative min-h-screen bg-black">
            {/* First Section with Video Background */}
            <div className="relative h-screen">
                <video
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/videos/aboutUs.mp4" type="video/mp4" />
                </video>

                <div className="relative z-10">
                    <Navbar scrollThreshold={10} />
                    <div className="flex flex-col items-center justify-center h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-3xl text-white leading-relaxed mt-[15vh] md:mt-[20vh] lg:mt-[25vh] mb-[10vh] md:mb-[15vh] lg:mb-[20vh]">
                            Welcome to our website! We are dedicated to providing the best service possible. Our team is passionate about what we do and we strive to exceed your expectations.
                        </h1>

                        <div className="animate-bounce absolute bottom-[0vh] md:bottom-[5vh] lg:bottom-[10vh]">
                            <svg
                                width="40"
                                height="120"
                                viewBox="0 0 40 120"
                                fill="none"
                                className="text-white"
                            >
                                <path
                                    d="M20 0 C20 100 20 100 20 160"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision Section */}
            <div className="bg-black mb-10 md:mb-20 lg:mb-30 -mt-10 md:-mt-20 lg:-mt-30">
                <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 md:px-12 lg:px-32">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-2xl text-white leading-relaxed mb-[5vh] md:mb-[7vh] lg:mb-[10vh]">
                        Our Vision
                    </h2>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full lg:w-4/5 gap-8 lg:gap-12">
                        <div className="flex-1 space-y-4 w-full text-center lg:text-left">
                            <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                We envision a world where ideas can flourish freely, fostering innovation and creativity.
                            </p>
                            <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                Our mission is to create a platform that empowers individuals and teams to bring their ideas to life.
                            </p>
                            <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                We believe in the power of collaboration and the importance of a supportive community.
                            </p>
                            <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed">
                                By providing the right tools and resources, we aim to help you transform your ideas into reality, no matter how big or small they may be.
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
                <h1 className="text-2xl md:text-3xl lg:text-4xl text-center max-w-2xl text-white leading-relaxed mb-16">
                    Meet our Team
                </h1>
                <div className="flex flex-row flex-wrap justify-center items-stretch gap-16 w-full max-w-7xl">
                    {/* First Team Member */}
                    <div className="flex flex-col items-center p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-[450px] md:w-[500px] lg:w-[550px] min-h-[500px] backdrop-blur-sm">
                        <Image
                            src="/Images/ideaG.jpg"
                            alt="Team Member 1"
                            width={400}
                            height={400}
                            className="w-40 h-40 rounded-full mb-6 object-cover"
                        />
                        <h2 className="text-2xl text-white mb-3 font-semibold">John Doe</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-6">Founder & CEO</p>
                        <p className="text-gray-400 text-center text-base leading-relaxed max-h-[200px] overflow-y-auto px-4">
                            Leading the vision and strategy of our company with over 10 years of experience in technology and innovation.
                        </p>
                    </div>

                    {/* Second Team Member */}
                    <div className="flex flex-col items-center p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] w-full sm:w-[450px] md:w-[500px] lg:w-[550px] min-h-[500px] backdrop-blur-sm">
                        <Image
                            src="/Images/ideaG.jpg"
                            alt="Team Member 2"
                            width={400}
                            height={400}
                            className="w-40 h-40 rounded-full mb-6 object-cover"
                        />
                        <h2 className="text-2xl text-white mb-3 font-semibold">Jane Smith</h2>
                        <p className="text-[#1f98f4] text-lg font-medium mb-6">CTO</p>
                        <p className="text-gray-400 text-center text-base leading-relaxed max-h-[200px] overflow-y-auto px-4">
                            Driving technical innovation and product development with expertise in scalable solutions and emerging technologies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page;
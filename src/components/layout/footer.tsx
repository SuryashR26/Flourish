"use client";

import React, { FC } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLightbulb } from 'react-icons/fa';

const Footer: FC = () => {
    return (
        <footer className="bg-black text-white font-sans p-8">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-start gap-8">
                {/* Logo and description */}
                <div className="flex-1 min-w-[200px]">
                    <h1 className="text-4xl flex items-center mb-6">
                        Flourish <FaLightbulb className="ml-2" />
                    </h1>
                    <div className="flex gap-12 mb-6">
                        <Link href="/" aria-label="Facebook" className="text-[#1877F2] hover:underline">
                            <FaFacebookF size={24} />
                        </Link>
                        <Link href="/about" aria-label="Instagram" className="text-[#E4405F] hover:underline">
                            <FaInstagram size={24} />
                        </Link>
                    </div>
                    <p className="text-gray-300 max-w-sm">
                        The Idea Board is a platform where you can share your ideas and get feedback from others. Join us today and start sharing your ideas!
                    </p>
                </div>

                {/* Footer menus */}
                <div className="flex-grow min-w-[600px] flex flex-wrap justify-around gap-8">
                    <div className="min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3">About us</h2>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/?carousel=true" className="hover:underline">How it works</Link></li>
                            <li><Link href="/about" className="hover:underline">Who we are</Link></li>
                            <li><Link href="/post" className="hover:underline">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3">Quick Links</h2>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/" className="hover:underline">Home</Link></li>
                            <li><Link href="/post" className="hover:underline">Post</Link></li>
                            <li><Link href="/post" className="hover:underline">Search</Link></li>
                            <li><Link href="/login" className="hover:underline">Login</Link></li>
                        </ul>
                    </div>
                    <div className="min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3">Contact Us</h2>
                        <ul className="space-y-4 text-gray-400">
                            {/* Replace with actual contact info or useful links */}
                            <li><Link href="/contact" className="hover:underline">Contact Form</Link></li>
                            <li><Link href="mailto:support@theideaboard.com" className="hover:underline">Email Us</Link></li>
                            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <hr className="border-t border-gray-400 mt-8 mb-4" />

            <div className="text-center text-xs text-gray-500">
                © 2025 TheIdeaBoard. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
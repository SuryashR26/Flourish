"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

function Navbar({ scrollThreshold = 300 }) {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const navMenuRef = useRef<HTMLUListElement>(null);

    const handleClick = () => {
        setClick((prev) => !prev);
    };

    const closeMobileMenu = () => {
        setClick(false);
    };

    const showButton = () => {
        setButton(window.innerWidth > 960);
    };

    useEffect(() => {
        showButton();
        window.addEventListener("resize", showButton);
        return () => window.removeEventListener("resize", showButton);
    }, []);

    useEffect(() => {
        const wrapper = document.getElementById("scroll-wrapper");
        if (!wrapper) return;

        const handleScroll = () => {
            setScrolled(wrapper.scrollTop > scrollThreshold);
        };

        wrapper.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => wrapper.removeEventListener("scroll", handleScroll);
    }, [scrollThreshold]);

    const links = [
        { href: "/", label: "Search" },
        { href: "/post", label: "Post" },
        { href: "/learn", label: "Learn" },
        { href: "/meet-flo", label: "Meet Flo" },
        { href: "/about", label: "About" },
        { href: "/contactUs", label: "Contact Us" },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                onClick={closeMobileMenu}
                className={`fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-500 ${click ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            <nav
                className={`fixed top-0 left-0 w-full h-20 z-50 flex justify-center items-center text-lg transition-colors duration-300 ${scrolled ? "bg-black" : "bg-transparent"
                    }`}
            >
                <div className="w-full max-w-[1500px] flex justify-between items-center px-6 md:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className="text-white text-4xl font-semibold flex items-center cursor-pointer select-none"
                    >
                        Flourish
                        <i className="fa-solid fa-lightbulb ml-2" />
                    </Link>

                    {/* Hamburger Icon */}
                    <div
                        onClick={handleClick}
                        className="text-white text-3xl cursor-pointer md:hidden z-50"
                        aria-label="Toggle Menu"
                    >
                        <i className={click ? "fas fa-times" : "fas fa-bars"} />
                    </div>

                    {/* Menu */}
                    <div
                        className={`fixed top-0 left-0 h-full w-[30vw] max-w-[300px] bg-black flex flex-col pt-20 px-5 gap-0 z-50 transition-transform duration-500 ease-in-out ${click ? "translate-x-0" : "-translate-x-full"
                            } md:static md:flex md:flex-row md:items-center md:h-auto md:w-auto md:bg-transparent md:pt-0 md:px-0`}
                    >
                        <ul
                            ref={navMenuRef}
                            className="flex flex-col md:flex-row md:gap-5 md:items-center list-none p-0 m-0"
                        >
                            {links.map(({ href, label }) => (
                                <li
                                    key={label}
                                    className="h-20 flex items-center md:h-auto md:px-3"
                                    onClick={closeMobileMenu}
                                >
                                    <Link
                                        href={href}
                                        className="text-white no-underline hover:text-gray-400 transition-colors duration-200 flex items-center h-full"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}

                            {/* Separator */}
                            <div className="hidden md:block h-6 w-[3px] bg-gray-400 rounded mx-3 self-center" />

                            {/* Login link */}
                            <li
                                className="h-20 flex items-center md:h-auto md:px-3"
                                onClick={closeMobileMenu}
                            >
                                <Link
                                    href="/login"
                                    className={`text-white no-underline hover:text-gray-400 transition-colors duration-200 flex items-center h-full ${button ? "hidden md:flex" : "block"
                                        }`}
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>

                        {/* Sign Up button - desktop only */}
                        {button && (
                            <Link href="/signup" onClick={closeMobileMenu} className="ml-2">
                                <Button buttonStyle="outline">SIGN UP</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;

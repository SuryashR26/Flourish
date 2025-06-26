"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import "@/styles/navbar.css";
import Button from "@/components/ui/button";
import { FaLightbulb, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface NavbarProps {
    scrollThreshold?: number;
}

const Navbar2: React.FC<NavbarProps> = ({ scrollThreshold = 80 }) => {
    const [click, setClick] = useState<boolean>(false);
    const [button, setButton] = useState<boolean>(true);
    const navMenuRef = useRef<HTMLUListElement | null>(null);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push("/search")
    }


    useEffect(() => {
        if (navMenuRef.current) {
            navMenuRef.current.classList.toggle("active", click);
        }
    }, [click]);

    const handleClick = () => {
        const overlay = document.querySelector(".overlay");
        if (!navMenuRef.current || !overlay) return;

        if (click) {
            navMenuRef.current.classList.remove("active");
            overlay.classList.remove("active");
            setClick(false);
        } else {
            navMenuRef.current.classList.add("active");
            overlay.classList.add("active");
            setClick(true);
        }
    };

    const closeMobileMenu = () => {
        const overlay = document.querySelector(".overlay");
        if (!navMenuRef.current || !overlay || !click) return;

        navMenuRef.current.classList.remove("active");
        overlay.classList.remove("active");
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

    return (
        <>
            <nav className={`navbar`}>
                <div className="navbar-container">
                    <Link href="/" className="navbar-logo" onClick={closeMobileMenu}>
                        Flourish <FaLightbulb />
                    </Link>
                    <div className="menu-icon" onClick={handleClick}>
                        {click ? <FaTimes /> : <FaBars />}
                    </div>
                    <div
                        className={click ? "overlay active" : "overlay"}
                        onClick={closeMobileMenu}
                    ></div>
                    <div className="!ml-10 !-mr-10 relative">
                        <form onSubmit={handleSubmit} className="flex items-center">
                            <input
                                type="text"
                                placeholder="Search for projects..."
                                className="w-[300px] h-[50px] !mt-0 rounded-md border border-gray-300 bg-[#181c23] text-white"
                                style={{ marginTop: "60px" }}
                            />
                            <FaSearch
                                className="absolute left-4 top-[15px] left-[270px] !bg-[#181c23] !text-white pointer-events-none"
                                style={{ fontSize: "1.5rem" }}
                            />
                        </form>
                    </div>
                    <div className="navbar-right">
                        <ul className="nav-menu" ref={navMenuRef}>
                            <li className="nav-item">
                                <Link href="/search" className="nav-links" onClick={closeMobileMenu}>

                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/post" className="nav-links" onClick={closeMobileMenu}>
                                    Post
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/meet-flo" className="nav-links" onClick={closeMobileMenu}>
                                    Meet Flo
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/about" className="nav-links" onClick={closeMobileMenu}>
                                    About
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/contactUs" className="nav-links" onClick={closeMobileMenu}>
                                    Contact Us
                                </Link>
                            </li>
                            <div className="nav-separator"></div>
                            <li className="nav-item">
                                <Link
                                    href="/"
                                    className={button ? "nav-links-mobile" : "nav-links"}
                                    onClick={closeMobileMenu}
                                >
                                    Messages
                                </Link>
                            </li>
                        </ul>
                        <Link href="/signup" className="no-underline hidden md:inline-block">
                            <Button
                                buttonStyle="outline"
                                buttonSize="large"
                                className="signup-button text-xl font-semibold"
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar2;


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from "@/components/ui/button";
import { FaLightbulb, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import "@/styles/navbar.css";

interface NavbarProps {
    showSearchBar?: boolean;
    showSeparator?: boolean;
    scrollThreshold?: number;
}

const Navbar: React.FC<NavbarProps> = ({ showSearchBar = false, showSeparator = false, scrollThreshold = 0 }) => {
    const [click, setClick] = useState<boolean>(false);
    const [button, setButton] = useState<boolean>(true);
    const [scrolled, setScrolled] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navMenuRef = useRef<HTMLUListElement | null>(null);
    const router = useRouter();

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            localStorage.setItem('searchQuery', searchQuery.trim());
            router.push('/search');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > scrollThreshold);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrollThreshold]);

    useEffect(() => {
        showButton();
        window.addEventListener("resize", showButton);
        return () => window.removeEventListener("resize", showButton);
    }, []);

    return (
        <>
            <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${showSeparator ? "navbar--with-separator" : ""}`}>
                <div className="navbar-container">
                    <div className="navbar-column-left">
                        <Link href="/" className="navbar-logo" onClick={closeMobileMenu}>
                            Flourish <FaLightbulb />
                        </Link>
                    </div>

                    {showSearchBar && (
                        <form onSubmit={handleSearch} className="navbar-search-container">
                            <FaSearch className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search for projects..."
                                className="navbar-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    )}

                    <div className="menu-icon" onClick={handleClick}>
                        {click ? <FaTimes /> : <FaBars />}
                    </div>
                    <div
                        className={click ? "overlay active" : "overlay"}
                        onClick={closeMobileMenu}
                    ></div>

                    <div className="navbar-column-right">
                        <ul className="nav-menu" ref={navMenuRef}>
                            {!showSearchBar && (
                                <li className="nav-item">
                                    <Link href="/search" className="nav-links" onClick={closeMobileMenu}>
                                        Search
                                    </Link>
                                </li>
                            )}
                            <li className="nav-item">
                                <Link href="/post" className="nav-links" onClick={closeMobileMenu}>
                                    Post
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
                                    href="/login"
                                    className={button ? "nav-links-mobile" : "nav-links"}
                                    onClick={closeMobileMenu}
                                >
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/signup" className="sign-up-btn-navbar">
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;


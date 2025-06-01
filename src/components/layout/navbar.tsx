"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Button from "@/components/ui/button"

interface NavbarProps {
    scrollThreshold?: number
}

export default function Navbar({ scrollThreshold = 300 }: NavbarProps) {
    const [click, setClick] = useState(false)
    const [button, setButton] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const navMenuRef = useRef<HTMLUListElement>(null)
    const pathname = usePathname()

    useEffect(() => {
        if (navMenuRef.current) {
            if (click) {
                navMenuRef.current.classList.add("active")
            } else {
                navMenuRef.current.classList.remove("active")
            }
        }
    }, [click])

    const handleClick = () => {
        if (!navMenuRef.current) return

        const overlay = document.querySelector(".overlay") as HTMLElement
        if (!overlay) return

        if (click) {
            navMenuRef.current.classList.remove("active")
            overlay.classList.remove("active")
            setClick(false)
        } else {
            navMenuRef.current.classList.add("active")
            overlay.classList.add("active")
            setClick(true)
        }
    }

    const closeMobileMenu = () => {
        if (!navMenuRef.current) return

        const overlay = document.querySelector(".overlay") as HTMLElement
        if (click && overlay) {
            navMenuRef.current.classList.remove("active")
            overlay.classList.remove("active")
            setClick(false)
        }
    }

    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false)
        } else {
            setButton(true)
        }
    }

    useEffect(() => {
        const wrapper = document.getElementById("scroll-wrapper")
        if (!wrapper) return

        const handleScroll = () => {
            const scrollTop = wrapper.scrollTop
            setScrolled(scrollTop > scrollThreshold)
        }

        wrapper.addEventListener("scroll", handleScroll)
        handleScroll()
        return () => wrapper.removeEventListener("scroll", handleScroll)
    }, [scrollThreshold])

    useEffect(() => {
        showButton()
        window.addEventListener("resize", showButton)
        return () => window.removeEventListener("resize", showButton)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 w-full h-20 z-[10000] flex justify-center items-center text-xl transition-colors duration-300 ${scrolled ? "bg-black" : "bg-transparent"
                }`}
        >
            <div className="flex justify-between items-center h-20 w-full px-6 max-w-[1500px]">
                <Link
                    href="/"
                    className="text-white justify-self-start ml-5 cursor-pointer no-underline text-4xl flex items-center"
                    onClick={closeMobileMenu}
                >
                    Flourish
                    <i className="fa-solid fa-lightbulb ml-2"></i>
                </Link>

                <div
                    className="menu-icon md:hidden block absolute top-5 left-5 text-2xl cursor-pointer z-[10003] text-white"
                    onClick={handleClick}
                >
                    <i className={click ? "fas fa-times" : "fas fa-bars"} />
                </div>

                <div
                    className={`overlay fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-lg z-[998] transition-all duration-500 ${click ? "opacity-100 visible" : "opacity-0 invisible"
                        }`}
                    onClick={closeMobileMenu}
                />

                <div className="flex items-center gap-1">
                    <ul
                        ref={navMenuRef}
                        className="nav-menu flex list-none text-center items-center mr-0 gap-1 md:flex md:static md:flex-row md:w-auto md:h-auto md:bg-transparent md:pt-0 md:pl-0 fixed left-[-100%] top-0 h-screen w-[30vw] bg-black flex-col items-start transition-all duration-500 justify-start pt-20 pl-5"
                    >
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/search"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                Search
                            </Link>
                        </li>
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/post"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                Post
                            </Link>
                        </li>
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/learn"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                Learn
                            </Link>
                        </li>
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/meet-flo"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                Meet Flo
                            </Link>
                        </li>
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/about"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                About
                            </Link>
                        </li>
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/contact"
                                className={`text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 ${scrolled ? "md:hover:shadow-[inset_0_-4px_0_0_#fff] md:hover:text-white" : ""
                                    } md:text-left md:text-xl md:p-2 md:h-auto md:mr-0 text-left text-xl p-4 h-auto mr-0`}
                                onClick={closeMobileMenu}
                            >
                                Contact Us
                            </Link>
                        </li>
                        <div className="h-1 w-4/5 bg-gray-400 my-4 rounded-sm md:h-6 md:w-1 md:bg-gray-400 md:mx-0 md:rounded-sm" />
                        <li className="h-20 md:h-auto md:flex md:justify-start md:items-center md:p-2 md:w-auto flex justify-start items-center p-2 w-full">
                            <Link
                                href="/login"
                                className={`${button ? "md:hidden" : "md:flex"} text-white flex items-center no-underline px-4 py-2 h-full transition-colors duration-200 hover:text-gray-400 text-left text-xl h-auto mr-0 md:block md:text-left md:my-4 md:rounded md:w-fit md:no-underline md:text-xl md:bg-transparent md:text-white md:py-2 md:px-4 md:border md:border-white md:transition-all md:duration-500`}
                                onClick={closeMobileMenu}
                            >
                                Login
                            </Link>
                        </li>
                    </ul>
                    <Link href="/signup" className="no-underline hidden md:inline-block">
                        <Button 
                            buttonStyle="outline" 
                            buttonSize="large" 
                            className="signup-button text-xl font-semibold"
                        >
                            SIGN UP
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}


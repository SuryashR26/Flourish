"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import "@/styles/navbar.css";
import  Button  from "@/components/ui/button";
import { FaFacebookF, FaInstagram, FaLightbulb, FaBars, FaTimes } from "react-icons/fa";

interface NavbarProps {
  scrollThreshold?: number;
}

const Navbar: React.FC<NavbarProps> = ({ scrollThreshold = 300 }) => {
  const [click, setClick] = useState<boolean>(false);
  const [button, setButton] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navMenuRef = useRef<HTMLUListElement | null>(null);

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
    const wrapper = document.getElementById("scroll-wrapper");

    const handleScroll = () => {
      if (wrapper) {
        const scrollTop = wrapper.scrollTop;
        setScrolled(scrollTop > scrollThreshold);
      }
    };

    wrapper?.addEventListener("scroll", handleScroll);
    handleScroll(); // run once on mount

    return () => wrapper?.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    showButton();
    window.addEventListener("resize", showButton);
    return () => window.removeEventListener("resize", showButton);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
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
        <div className="navbar-right">
          <ul className="nav-menu" ref={navMenuRef}>
            <li className="nav-item">
              <Link href="/" className="nav-links" onClick={closeMobileMenu}>
                Search
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/post" className="nav-links" onClick={closeMobileMenu}>
                Post
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/learn" className="nav-links" onClick={closeMobileMenu}>
                Learn
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
                href="/login"
                className={button ? "nav-links-mobile" : "nav-links"}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </li>
          </ul>
          {button && (
            <Link href="/signup" className="no-decoration">
              <Button buttonStyle="btn--outline">SIGN UP</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


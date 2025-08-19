"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import Button from "@/components/ui/button";
import { FaLightbulb, FaBars, FaTimes, FaSearch, FaCog } from "react-icons/fa";
import "@/styles/navbar.css";
import "@/styles/settings.css";
import { useUser } from '@/context/UserContext';
import SettingsPopup from '@/components/ui/SettingsPopup';


interface NavbarProps {
  showSearchBar?: boolean;
  showSeparator?: boolean;
  scrollThreshold?: number;
}

const Navbar: React.FC<NavbarProps> = ({ showSearchBar = false, showSeparator = false, scrollThreshold = 0, }) => {
  const [click, setClick] = useState<boolean>(false);
  const [button, setButton] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navMenuRef = useRef<HTMLUListElement | null>(null);
  const router = useRouter();
  const { user, logout, isLoggedIn, isInitialized } = useUser();
  console.log("Navbar user profileurl:", user?.profileurl);

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
    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (open && !target.closest('.relative')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${showSeparator ? "navbar--with-separator" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-column-left">
            <Link href="/" className="navbar-logo" onClick={closeMobileMenu}>
              Flourish <FaLightbulb />
            </Link>
          </div>

          {(showSearchBar || (!isInitialized || isLoggedIn)) && (
            <form onSubmit={handleSearch} className="navbar-search-container">
              <FaSearch className="navbar-search-icon" />
              <input
                type="text"
                placeholder="Search for projects..."
                className="navbar-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!isInitialized}
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
              {/* Always show Dashboard button if user is/might be logged in */}
              {(!isInitialized || isLoggedIn) && (
                <li className="nav-item">
                  <Link href="/dashboard" className="nav-links" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link href="/search" className="nav-links" onClick={closeMobileMenu}>
                  Browse
                </Link>
              </li>
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
              {isInitialized && !isLoggedIn &&
                <li className="nav-item">
                  <Link
                    href="/login"
                    className={button ? "nav-links-mobile" : "nav-links"}
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </li>
              }
              {/* Always show Messages button if user is/might be logged in */}
              {(!isInitialized || isLoggedIn) &&
                <li className='nav-item'>
                  <Link
                    href="/messages"
                    className={button ? "nav-links-mobile" : "nav-links"}
                    onClick={closeMobileMenu}
                  >
                    Messages
                  </Link>
                </li>
              }
              {isInitialized && !isLoggedIn &&
                <li className="nav-item">
                  <Link href="/signup" className="sign-up-btn-navbar">
                    Sign Up
                  </Link>
                </li>
              }
              {/* Show profile picture placeholder or actual profile during initialization */}
              {(!isInitialized || isLoggedIn) &&
                <li className="">
                  <div className="relative inline-block text-left">

                    {/* Profile picture */}
                    <img
                      src={user?.profileurl || "/images/defaultProfile.jpg"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-gray-300"
                      onClick={() => isInitialized && setOpen(!open)}
                      onError={(e) => {
                        e.currentTarget.onerror = null; // prevents infinite loop if fallback fails
                        e.currentTarget.src = '/images/defaultProfile.jpg';
                      }}
                      style={{ opacity: isInitialized ? 1 : 0.7 }}
                    />

                    {/* Dropdown menu - only show when initialized */}
                    {isInitialized && open && (
                      <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1 ">
                          <button className="block px-4 py-2 !mt-3 !mb-2 text-sm text-white hover:bg-gray-800 w-full text-left" onClick={() => {
                            router.push('/dashboard');
                            setOpen(false);
                          }}>
                            Dashboard
                          </button>

                          <button className="block px-4 py-2 text-sm text-white hover:bg-gray-800 w-full text-left flex items-center gap-2" onClick={() => {
                            setSettingsOpen(true);
                            setOpen(false);
                          }}>
                            <FaCog />
                            Settings
                          </button>

                          <button className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-800 w-full text-left" onClick={() => logout()}>
                            Log out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </li>
              }
            </ul>
          </div>
        </div>
      </nav>

      {/* Settings Popup */}
      <SettingsPopup 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;


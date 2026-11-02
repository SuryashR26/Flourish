"use client"; // Only if you're using this in `app/` and need client-side interactivity

import React from "react";
import Link from "next/link";
import "@/styles/footer.css";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
// import { FaLightbulb } from "react-icons/fa";
import FlourishLogo from "@/components/ui/FlourishLogo";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h1>
            Flourish Board {/* <FaLightbulb /> */}
            <FlourishLogo />
          </h1>
          <div className="social-icons">
            <Link href="/"><FaFacebookF className="facebook" /></Link>
            <Link href="/about"><FaInstagram className="instagram" /></Link>
          </div>
          <p>
            Flourish Board is a platform where you can share your ideas and
            get feedback from others. Join us today and start sharing your
            ideas!
          </p>
        </div>

        <div className="footer-menus">
          <div className="footer-about">
            <h2>About us</h2>
            <ul>
              <li><Link href="/?carousel=true">How it works</Link></li>
              <li><Link href="/about">Who we are</Link></li>
              <li><Link href="/post">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h2>Quick Links</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/post">Post</Link></li>
              {/* <li><Link href="/search">Search</Link></li> */}
              {/* <li><Link href="/login">Login</Link></li> */}
            </ul>
          </div>
          <div className="footer-extra">
            <h2>Contact Us</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/post">Post</Link></li>
              {/* <li><Link href="/search">Search</Link></li> */}
              {/* <li><Link href="/login">Login</Link></li> */}
              <li><Link href="/contactUs">Message us</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <hr className="footer-line" />
      <div className="footer-copy">
        <h3>© 2025 Flourish Board. All rights reserved.</h3>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar"; // adjust path accordingly
import Footer from "@/components/layout/footer"; // adjust path accordingly
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scrollWrapper = document.getElementById("scroll-wrapper");

    const handleScroll = () => {
      if (scrollWrapper) {
        const scrollTop = scrollWrapper.scrollTop;
        const scrollHeight = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress);
      }
    };

    if (scrollWrapper) {
      scrollWrapper.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollWrapper) {
        scrollWrapper.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <html lang="en">
      <head />
      <body className="overflow-x-hidden">
        <Navbar />

        <div
          id="scroll-wrapper"
          className="mt-16 mb-16 h-screen overflow-y-auto overflow-x-hidden max-h-screen"
          style={{ maxHeight: "100vh" }}
        >
          <div
            className="fixed top-0 left-0 h-1 bg-blue-500 z-[10001] transition-[width] ease-out duration-100"
            style={{ width: `${scrollProgress}%` }}
          />
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}



"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollLine = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
    }
  }, []);

  useEffect(() => {
    if (!pathRef.current || !svgContainerRef.current || !pathLength) return;

    gsap.fromTo(
      pathRef.current,
      { strokeDashoffset: pathLength },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: svgContainerRef.current,
          start: "top 90%",
          end: "bottom top",
          scrub: 1,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [pathLength]);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50 w-[120px] h-[300px] scroll-line-container"
      ref={svgContainerRef}
      style={{ height: "300px", overflow: "visible" }}
    >
      <svg
        width="120"
        height="300"
        viewBox="0 0 120 300"
        fill="none"
        className="text-white"
        style={{ overflow: "visible", height: "300px" }}
      >
        <path
          ref={pathRef}
          d="M60 0 C90 100 30 200 60 300"
          stroke="#58a6ff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default ScrollLine; 
"use client";

import React, { useEffect, useState, useRef } from 'react';

interface StatsCounterProps {
    target: number;
    duration?: number;
    className?: string;
    suffix?: string;
    decimals?: number;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
    target,
    duration = 2000,
    className,
    suffix = '',
    decimals = 0
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    useEffect(() => {
        if (isIntersecting) {
            const start = 0;
            const end = target;
            if (start === end) return;

            // Calculate total steps based on smallest decimal
            const totalSteps = Math.max(100, Math.ceil(duration / 15));
            const increment = (end - start) / totalSteps;

            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep += 1;
                const newCount = start + increment * currentStep;

                if (currentStep >= totalSteps) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(newCount);
                }
            }, duration / totalSteps);

            return () => clearInterval(timer);
        }
    }, [isIntersecting, target, duration]);

    return (
        <span ref={ref} className={className}>
            {count.toFixed(decimals)}{suffix}
        </span>
    );
};

export default StatsCounter; 
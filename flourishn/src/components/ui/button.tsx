"use client"

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type ButtonProps = {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    href?: string;
    buttonStyle?: string;
    buttonSize?: string;
    animatedBorder?: boolean;
    borderAnimationDelay?: number;
};

const forcedStyle = {
    outline: "none",
    cursor: "pointer",
};

const Button = ({
    children,
    type = 'button',
    onClick,
    className = '',
    href,
    buttonStyle = 'btn--outline',
    buttonSize = 'btn--large',
    animatedBorder = false,
    borderAnimationDelay = 1000,
}: ButtonProps) => {
    const textRef = useRef<HTMLSpanElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (animatedBorder && textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            setDimensions({
                width: rect.width,
                height: rect.height,
            });
        }
    }, [animatedBorder, children]);

    const btnClass = `btn ${buttonStyle} ${buttonSize} ${className}`.trim();

    const isSignup = className.includes('signup-button');
    const buttonStyles = `
        .btn {
            outline: none;
            background: transparent;
            color: #14171c;
            display: inline-block;
            text-decoration: none;
            border-radius: 12px;
            border: none;
            -webkit-tap-highlight-color: transparent;
            position: relative;
            overflow: hidden;
        }
        .btn:focus-visible {
            outline: 2px solid #1f98f4;
            outline-offset: 2px;
        }
        /* Left-to-right animated background */
        .btn::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 0%;
            height: 100%;
            background: #1f98f4;
            border-radius: inherit;
            z-index: -1;
            transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .btn span {
            color: #14171c;
            transition: color 0.25s;
        }
        .btn:hover::after,
        .btn:focus::after {
            width: 100%;
        }
        .btn:hover span,
        .btn:hover span * {
            color: #fff !important;
            transition: color 0.25s;
        }
        .btn--outline {
            background: transparent;
            color: #14171c;
        }
        .btn--medium {
            font-size: 1.25rem;
        }
        .btn--large {
            font-size: 2rem;
        }
        @keyframes dash {
            to {
                stroke-dashoffset: 0;
            }
        }
        ${isSignup ? `
        .signup-button {
            border: 2px solid #14171c !important;
            border-radius: 12px !important;
            padding: 6px 15px !important;
            background: transparent !important;
            color: #14171c !important;
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            transition: none !important;
        }
        .signup-button::after {
            display: none !important;
        }
        .signup-button:hover, .signup-button:focus {
            background: #1f98f4 !important;
            color: #fff !important;
            border: 2px solid #1f98f4 !important;
            transition: none !important;
        }
        .signup-button:hover span, .signup-button:focus span {
            color: #fff !important;
            transition: none !important;
        }
        ` : ''}
    `;

    const textPadding = buttonSize === 'btn--large' ? 'px-10 py-4 text-5xl font-extrabold' : buttonSize === 'btn--medium' ? 'px-6 py-2 text-xl font-semibold' : 'px-4 py-1 text-base font-semibold';
    const borderRadius = buttonSize === 'btn--large' ? 24 : 18; // px

    if (animatedBorder) {
        const BUTTON_WIDTH = dimensions.width || 170;
        const BUTTON_HEIGHT = dimensions.height || 56;
        const BORDER_RADIUS = 10;
        const borderDash = 2 * (BUTTON_WIDTH - 3) + 2 * (BUTTON_HEIGHT - 3);
        const animatedContent = (
            <div
                className="relative inline-flex items-center justify-center group overflow-hidden"
                style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
            >
                <span
                    className="relative font-extrabold text-xl w-full text-center select-none"
                    style={{
                        lineHeight: `${BUTTON_HEIGHT}px`,
                        borderRadius: `${BORDER_RADIUS}px`,
                        padding: '0 16px',
                        fontSize: '1.25rem',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                    }}
                >
                    {children}
                </span>
                <svg
                    className="pointer-events-none absolute top-0 left-0"
                    width={BUTTON_WIDTH}
                    height={BUTTON_HEIGHT}
                    viewBox={`0 0 ${BUTTON_WIDTH} ${BUTTON_HEIGHT}`}
                    fill="none"
                    style={{ overflow: "visible" }}
                >
                    <rect
                        x="1.5"
                        y="1.5"
                        width={BUTTON_WIDTH - 3}
                        height={BUTTON_HEIGHT - 3}
                        rx={BORDER_RADIUS}
                        stroke="#1f98f4"
                        strokeWidth="3"
                        fill="none"
                        style={{
                            strokeDasharray: borderDash,
                            strokeDashoffset: borderDash,
                            animation: `dash 0.9s cubic-bezier(.25, .1, .25, 1.0) forwards ${borderAnimationDelay}ms`,
                        }}
                    />
                </svg>
                <style jsx>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                `}</style>
            </div>
        );
        if (href) {
            return (
                <Link href={href} className={btnClass} style={forcedStyle}>
                    {animatedContent}
                </Link>
            );
        }
        return (
            <button className={btnClass} onClick={onClick} type={type} style={forcedStyle}>
                {animatedContent}
            </button>
        );
    }

    const content = (
        <div className="relative inline-block">
            <span
                ref={textRef}
                className={`select-none bg-transparent relative z-10 ${textPadding}`}
                style={{ borderRadius: `${borderRadius}px`, display: 'inline-block' }}
            >
                {children}
            </span>
            <style jsx>{buttonStyles}</style>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className={btnClass} style={forcedStyle}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={btnClass}
            onClick={onClick}
            type={type}
            style={forcedStyle}
        >
            {content}
        </button>
    );
};

export default Button;

"use client"

import type React from "react"
import Link from "next/link"

const STYLES = ["primary", "outline"] as const
const SIZES = ["medium", "large"] as const

type ButtonStyle = (typeof STYLES)[number]
type ButtonSize = (typeof SIZES)[number]

interface ButtonProps {
    children: React.ReactNode
    type?: "button" | "submit" | "reset"
    onClick?: () => void
    buttonStyle?: ButtonStyle
    buttonSize?: ButtonSize
    className?: string
    href?: string
}

export default function Button({
    children,
    type = "button",
    onClick,
    buttonStyle = "primary",
    buttonSize = "medium",
    className = "",
    href,
}: ButtonProps) {
    const baseClasses =
        "relative overflow-hidden z-10 transition-colors duration-300 font-semibold cursor-pointer outline-none border-2 border-white rounded-xl"

    const styleClasses = {
        primary: "bg-white text-gray-800 border-white",
        outline: "bg-transparent text-white border-white",
    }

    const sizeClasses = {
        medium: "py-2 px-6 text-base",
        large: "py-4 px-8 text-xl",
    }

    const hoverClasses =
        buttonStyle === "primary" ? "hover:bg-gray-800 hover:text-white" : "hover:bg-white hover:text-gray-800"

    const buttonClasses = `${baseClasses} ${styleClasses[buttonStyle]} ${sizeClasses[buttonSize]} ${hoverClasses} ${className}`

    if (href) {
        return (
            <Link href={href} className={buttonClasses}>
                {children}
            </Link>
        )
    }

    return (
        <button className={buttonClasses} onClick={onClick} type={type}>
            {children}
        </button>
    )
}

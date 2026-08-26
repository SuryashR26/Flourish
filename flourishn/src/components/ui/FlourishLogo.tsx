import React from "react"

interface FlourishLogoProps {
    className?: string
}

// "Idea Bloom" mark: five petals, each a different accent color,
// converging on a single point — separate contributions forming one idea.
const PETAL_COLORS = [
    "#1f98f4", // blue
    "#35c2a0", // teal
    "#7cc576", // green
    "#f0b429", // amber
    "#e0648f", // rose
]

const PETAL_PATH = "M24 24C24 24 24 10 24 6C29 8 30 18 24 24Z"

const FlourishLogo: React.FC<FlourishLogoProps> = ({ className }) => {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            {PETAL_COLORS.map((color, index) => (
                <g key={color} transform={`rotate(${index * 72} 24 24)`}>
                    <path d={PETAL_PATH} fill={color} />
                </g>
            ))}
            <circle cx="24" cy="24" r="3.4" fill="currentColor" />
        </svg>
    )
}

export default FlourishLogo

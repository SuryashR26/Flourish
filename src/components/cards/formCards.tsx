"use client"

import React from "react"
import "@/styles/formCard.css"

interface FormCardProps {
    title: string
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    buttonClassName?: string
    submitLabel?: string
    showSubmitButton?: boolean
}

interface FormRowProps {
    children: React.ReactNode
    className?: string
}

function FormRow({ children, className = "" }: FormRowProps) {
    return (
        <div className={`form-row flex w-full gap-4 ${className}`}>
            {React.Children.map(children, (child) => (
                <div className="flex-1 w-full">{child}</div>
            ))}
        </div>
    )
}

function FormCard({ title, onSubmit, children, className = "", style, buttonClassName, submitLabel = "Submit", showSubmitButton = true }: FormCardProps & { style?: React.CSSProperties }) {
    return (
        <div className={`form-card ${className}`} style={style}>
            <div className="form-card__content">
                <h2 className="form-card__title">{title}</h2>
                <form onSubmit={onSubmit} className="form-card__form">
                    {children}
                    {showSubmitButton && (
                        <button
                            type="submit"
                            className={buttonClassName ? buttonClassName : "form-card__button"}
                        >
                            {submitLabel}
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

// Attach FormRow as a static property to FormCard
FormCard.Row = FormRow

export default FormCard
export { FormRow }

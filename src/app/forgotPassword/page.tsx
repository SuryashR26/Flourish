"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { FaLightbulb } from "react-icons/fa"
import FormCard from "@/components/cards/formCards"

interface EmailValues {
    email: string
}

interface FormErrors {
    email?: string
}

export default function ForgetPassword() {
    const [emailValues, setEmailValues] = useState<EmailValues>({
        email: ""
    })
    
    const [errors, setErrors] = useState<FormErrors>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEmailValues({
            ...emailValues,
            [name]: value
        })
        if (errors[name as keyof FormErrors]) {
            setErrors({
                ...errors,
                [name]: ""
            })
        }
    }

    const validateForm = (): boolean => {
        const tempErrors: FormErrors = {}
        let isValid = true
        
        if (!emailValues.email.trim()) {
            tempErrors.email = "Email is required"
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(emailValues.email)) {
            tempErrors.email = "Please enter a valid email address"
            isValid = false
        }
        
        setErrors(tempErrors)
        return isValid
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isValid = validateForm()
        if (isValid) {
            setEmailValues({ email: "" })
            setErrors({})
            console.log("Password reset email sent successfully")
        } else {
            console.log("Form validation failed", errors)
        }
    }

    return (
        <div className="login-container">
            {/* Site Logo */}
            <Link href="/" className="site-logo">
                Flourish
                <FaLightbulb />
            </Link>

            {/* Forgot Password Content */}
            <div className="login-content">
                <FormCard title="Reset your Password" onSubmit={handleSubmit}>
                    <p className="text-white text-base leading-normal my-3 text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="form-group">
                        <input 
                            type="email" 
                            id="email"
                            value={emailValues.email} 
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            name="email" 
                            placeholder="Email"
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>
                    <button type="submit">
                        Send Reset Link
                    </button>
                </FormCard>
            </div>
        </div>
    )
}

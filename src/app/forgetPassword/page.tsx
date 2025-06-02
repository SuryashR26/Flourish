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
        <div className="min-h-screen bg-black relative">
            <Link href="/" className="absolute top-5 left-5 text-4xl cursor-pointer text-white no-underline flex items-center">
                Flourish
                <FaLightbulb className="ml-2" />
            </Link>

            <div className="flex justify-center items-center min-h-screen">
                <FormCard title="Reset your Password" onSubmit={handleSubmit}>
                    <p className="text-white text-center mb-4">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="mb-4 relative">
                        <label htmlFor="email" className="block text-white mb-2">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={emailValues.email}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-lg bg-[#181c23] text-white border ${errors.email ? "border-red-500" : "border-[#222]"
                                }`}
                            name="email"
                        />
                        {errors.email && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                    >
                        Send Reset Link
                    </button>
                </FormCard>
            </div>
        </div>
    )
}

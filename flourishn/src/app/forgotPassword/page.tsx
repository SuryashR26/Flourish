"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { FaLightbulb } from "react-icons/fa"
import FormCard from "@/components/cards/formCards"
import { resetPass } from "@/api/apiClient"

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
    const [errorMessage, setErrorMessage] = useState<boolean>(false)
    const [errorText, setErrorText] = useState<string>("")

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

            setErrors({})
            resetPass(emailValues.email)
                .then(response => {
                    if (response.success === false) {
                        setErrors(prev => ({ ...prev, email: response.message }))
                    } else {
                        setErrorText("A reset link has been sent to your email address. Please check your inbox.")
                        setErrorMessage(true)
                        setEmailValues({ email: "" })
                    }
                })

        } else {
            console.log("Form validation failed", errors)
        }
    }

    return (
        <div className="login-container">
            {/* Site Logo */}
            <Link href="/" className="login-site-logo">
                Flourish
                <FaLightbulb />
            </Link>

            {/* Forgot Password Content */}
            <div className="login-content">
                <FormCard title="Reset your Password" onSubmit={handleSubmit} style={{ width: '500px' }}>
                    <p className="text-white text-base leading-normal my-3 text-center">
                        Enter your email address and we`&apos;`ll send you a link to reset your password.
                    </p>
                    <div className="login-form-group">
                        <input
                            type="email"
                            id="email"
                            value={emailValues.email}
                            onChange={handleChange}
                            className={errors.email ? 'login-error' : ''}
                            name="email"
                            placeholder="Email"
                        />
                        {errors.email && <div className="login-error-message">{errors.email}</div>}
                    </div>
                    <button type="submit">
                        Send Reset Link
                    </button>
                </FormCard>
                {errorMessage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center min-w-[300px] bg-black/40 backdrop-blur-sm"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="relative bg-black text-white text-md p-6 min-w-[300px] min-h-[150px] max-w-2xl rounded-lg shadow-xl text-center mt-10">
                            <div className="absolute left-0 top-0 w-full flex justify-end">
                                <button
                                    onClick={() => setErrorMessage(false)}
                                    className="text-white text-2xl font-bold hover:text-gray-400 focus:outline-none p-2"
                                    aria-label="Close"
                                    style={{ zIndex: 10 }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="flex flex-col items-center justify-center h-full !mt-10">
                                {errorText}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

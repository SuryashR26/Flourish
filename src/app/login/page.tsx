"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { FaLightbulb, FaEye, FaEyeSlash } from "react-icons/fa"
import FormCard from "@/components/cards/formCards"
import "@/styles/login.css"

interface LoginValues {
    username: string
    password: string
}

interface LoginErrors {
    username?: string
    password?: string
}

export default function LoginPage() {
    const pathname = usePathname()
    const [loginValues, setLoginValues] = useState<LoginValues>({
        username: "",
        password: "",
    })

    const [errors, setErrors] = useState<LoginErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)

    useEffect(() => {
        setIsNavigating(false)
    }, [pathname])

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLoginValues({
            ...loginValues,
            [name]: value,
        })
        if (errors[name as keyof LoginErrors]) {
            setErrors({
                ...errors,
                [name]: "",
            })
        }
    }

    const validateForm = (): boolean => {
        const tempErrors: LoginErrors = {}
        let isValid = true

        if (!loginValues.username.trim()) {
            tempErrors.username = "Username or Email is required"
            isValid = false
        }

        if (!loginValues.password.trim()) {
            tempErrors.password = "Password is required"
            isValid = false
        } else if (loginValues.password.length < 8) {
            tempErrors.password = "Password must be at least 8 characters long"
            isValid = false
        }

        setErrors(tempErrors)
        return isValid
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isValid = validateForm()
        if (isValid) {
            setLoginValues({
                username: "",
                password: "",
            })
            setErrors({})
            console.log("Login successful")
            // Add your login logic here
        } else {
            console.log("Login failed", errors)
        }
    }

    const handleSignUpClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsNavigating(true)
        window.location.href = '/signUp'
    }

    if (isNavigating) {
        return <div>Loading...</div>
    }

    return (
        <div className="login-container">
            {/* Site Logo */}
            <Link href="/" className="site-logo">
                Flourish
                <FaLightbulb />
            </Link>

            {/* Login Content */}
            <div className="login-content">
                <FormCard title="Log in to Flourish" onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            value={loginValues.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                            name="username"
                            placeholder="Username or Email"
                        />
                        {errors.username && <div className="error-message">{errors.username}</div>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={loginValues.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                name="password"
                                placeholder="Password"
                            />
                            <span className="password-toggle" onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="forget-password">
                        <Link href="/forgotPassword">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button type="submit">
                        Login
                    </button>
                </FormCard>

                {/* Separator and Sign Up Link */}
                <div className="login-separator-section">
                    <div className="login-separator" />
                    <div className="login-bottom-text">
                        <span>
                            Don't have an account?{" "}
                            <a href="/signUp" onClick={handleSignUpClick}>
                                Sign Up
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

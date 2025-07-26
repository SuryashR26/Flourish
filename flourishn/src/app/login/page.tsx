"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { FaLightbulb, FaEye, FaEyeSlash, FaGoogle, FaGraduationCap } from "react-icons/fa"
import FormCard from "@/components/cards/formCards"
import "@/styles/login.css"
import { login } from "@/api/apiClient"

interface LoginValues {
    username: string
    password: string
}

interface LoginErrors {
    username?: string
    password?: string
}

export default function LoginPage() {
    const [loginValues, setLoginValues] = useState<LoginValues>({
        username: "",
        password: "",
    })

    const [errors, setErrors] = useState<LoginErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordField, setShowPasswordField] = useState(true)
    const [errorMessage, setErrorMessage] = useState(false)
    const [errorText, setErrorText] = useState<string>("");
    const router = useRouter()

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    useEffect(() => {
        async function checkSession() {
            const res = await fetch('http://localhost:8080/check-session', {
                credentials: 'include',  // <-- add this line
            });
            const data = await res.json();
            if (!data.success) {
                router.push('/dashboard');
            }
        }
        checkSession();
    }, []);

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

    const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setShowPasswordField(false)
        }
    }

    const handleLogIn = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            setLoginValues({
                username: "",
                password: "",
            });
            setErrors({});
        } else {
            console.log("Login failed", errors);
            return;
        }
        login(loginValues.username, loginValues.password)
            .then(response => {
                if (!response.success) {
                    setErrorText(response.message || "There was an error logging.");
                    setErrorMessage(true);
                    return;

                }
                console.log("Login Successfully", response);
                router.push('/dashboard')

            })

    }

    const validateForm = (): boolean => {
        const tempErrors: LoginErrors = {}
        let isValid = true

        if (!loginValues.username.trim()) {
            tempErrors.username = " Email is required"
            isValid = false
        }

        if (!loginValues.password.trim()) {
            tempErrors.password = "Password is required"
            isValid = false
        }
        if (!loginValues.username.trim() || !/\S+@\S+\.\S+/.test(loginValues.username)) {
            tempErrors.username = "Please enter a valid email address"
            isValid = false;
        }

        setErrors(tempErrors)
        return isValid
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!showPasswordField) {
            if (!loginValues.username.trim()) {
                setErrors({ username: "Username or email is required" });
                return;
            }
            setErrors({}); // Clear any errors
            setShowPasswordField(true);
            return;
        }

        const isValid = validateForm();
        if (isValid) {
            setLoginValues({
                username: "",
                password: "",
            });
            setErrors({});
            console.log("Login successful");
            router.push('/');
        } else {
            console.log("Login failed", errors);
        }
    };

    return (
        <>
            <div className="center-guide-line"></div>
            <div className="login-container">
                {/* Site Logo */}
                <Link href="/" className="login-site-logo">
                    Flourish
                    <FaLightbulb />
                </Link>

                {/* Top Right Buttons */}
                <div className="login-top-buttons">
                    <Link href="/contactUs" className="contact-us-btn">Contact Us</Link>
                    <Link href="/signup" className="sign-up-btn">Sign Up</Link>
                </div>

                {/* Login Content */}
                <div className="login-content">
                    <FormCard title="Log in to Flourish" onSubmit={handleSubmit} style={{ width: '468px', marginBottom: '9rem' }} showSubmitButton={false}>
                        {/* Social Login Buttons */}
                        <button type="button" className="social-login-btn google-btn">
                            <FaGoogle className="google-icon" /> Continue with Google
                        </button>
                        <button type="button" className="social-login-btn sso-btn">
                            <FaGraduationCap className="sso-icon" /> Continue with School SSO
                        </button>
                        {/* Separator */}
                        <div className="login-or-separator">
                            <span>or</span>
                        </div>
                        {/* Username Field */}
                        <div className="form-group">
                            <input
                                type="text"
                                id="username"
                                value={loginValues.username}
                                onChange={handleChange}
                                onKeyDown={handleUsernameKeyDown}
                                className={errors.username ? 'error' : ''}
                                name="username"
                                placeholder="Username or Email"
                            />
                            {errors.username && <div className="error-message">{errors.username}</div>}
                        </div>
                        {/* Password Field (slide down) */}
                        <div className={`form-group password-slide${showPasswordField ? ' show' : ''}`} style={{ overflow: 'hidden' }}>
                            {showPasswordField && (
                                <div className="login-password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={loginValues.password}
                                        onChange={handleChange}
                                        className={errors.password ? 'error' : ''}
                                        name="password"
                                        placeholder="Password"
                                    />
                                    <span className="login-password-toggle" onClick={togglePasswordVisibility}>
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                            )}
                            {showPasswordField && errors.password && <div className="error-message">{errors.password}</div>}
                        </div>
                        <div className="forget-password">
                            <Link href="/forgotPassword">
                                Forgot Password?
                            </Link>
                        </div>
                        <button type="submit"
                            onClick={handleLogIn}
                        >
                            Log in
                        </button>
                    </FormCard>
                    {errorMessage && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center min-w-[300px] bg-black/40 backdrop-blur-sm"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <div className="relative bg-black text-white text-md p-6 min-w-[300px] min-h-[150px] max-w-2xl rounded-lg shadow-xl text-center mt-10">
                                {/* X button overlayed above the text */}
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

                    {/* Separator and Sign Up Link */}
                    <div className="login-separator-section">
                        <div className="login-separator" />
                        <div className="login-bottom-text">
                            <span>
                                Don`&apos;`t have an account?{" "}
                                <Link href="/signup">
                                    Sign Up
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

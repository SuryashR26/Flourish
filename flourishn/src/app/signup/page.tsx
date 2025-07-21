'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import "@/styles/login.css";
import { FaEye, FaEyeSlash, FaLightbulb, FaGoogle, FaGraduationCap, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import FormCard from "@/components/cards/formCards";
import { signup } from "@/api/apiClient"; // 
import { sign } from 'crypto';
interface SignUpForm {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    countryCode: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    verificationCode: string; // Optional for the first step
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    birthDay?: string;
    birthMonth?: string;
    birthYear?: string;
    verificationCode?: string;

}

export default function SignUp() {
    const router = useRouter();
    const [signUpValues, setSignUpValues] = useState<SignUpForm>({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        countryCode: '+1',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        verificationCode: '', // Optional for the first step
    });

    const [dayValue, setDayValue] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timer, setTimer] = useState(0);
    const [timer2, setTimer2] = useState(0);
    const [errorMessage, setErrorMessage] = useState(false)
    const [errorText, setErrorText] = useState<string>("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const timer2Ref = useRef<NodeJS.Timeout | null>(null);



    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (value === "01" || value === "03" || value === "05" || value === "07" ||
            value === "08" || value === "10" || value === "12") {
            setDayValue(1);
        } else if (value === "04" || value === "06" || value === "09" || value === "11") {
            setDayValue(2);
        } else if (value === "02") {
            setDayValue(3);
        }
        setSignUpValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['birthDay', 'birthMonth', 'birthYear'];

        // Clear the error for the field being edited
        setErrors(prev => ({ ...prev, [name]: undefined }));

        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '');
            let formattedValue = '';
            if (numericValue.length > 0) {
                formattedValue = numericValue.substring(0, 3);
                if (numericValue.length >= 4) {
                    formattedValue += '-' + numericValue.substring(3, 6);
                }
                if (numericValue.length >= 7) {
                    formattedValue += '-' + numericValue.substring(6, 10);
                }
            }
            setSignUpValues(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (numericFields.includes(name)) {
            const numericValue = value.replace(/\D/g, '');
            setSignUpValues(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setSignUpValues(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleVerificationFocus = (idx: number) => {
        setFocusedIndex(idx);
    };

    const handleVerificationBlur = () => {
        setFocusedIndex(null);
    };

    const handleVerificationCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUpValues.email.trim() || !/\S+@\S+\.\S+/.test(signUpValues.email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }
        setErrors({});
        signup(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, signUpValues.verificationCode)
            .then(response => {
                console.log('Signup was:', response);
                if (response.success === false) {
                    setErrorMessage(true);
                    setErrorText(response.message);

                } else {
                    setCurrentStep(2);
                    setTimer(60);
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => {
                        setTimer(prev => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current!);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                    setTimer2(300);
                    if (timer2Ref.current) clearInterval(timer2Ref.current);
                    timer2Ref.current = setInterval(() => {
                        setTimer2(prev => {
                            if (prev <= 1) {
                                clearInterval(timer2Ref.current!);
                                signup(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, 'Failed')
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Signup error:', error);
                setErrorMessage(true);
                setErrorText("An error occurred while sending the verification code. Please try again.");
            });

    }

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        let tempErrors: FormErrors = {};
        if (!signUpValues.firstName.trim()) tempErrors.firstName = "First name is required";
        if (!signUpValues.lastName.trim()) tempErrors.lastName = "Last name is required";
        if (!signUpValues.password.trim()) tempErrors.password = "Password is required";
        else if (signUpValues.password.length < 8) tempErrors.password = "Password must be at least 8 characters";
        if (!signUpValues.confirmPassword.trim()) tempErrors.confirmPassword = "Confirm password is required";
        else if (signUpValues.password !== signUpValues.confirmPassword) tempErrors.confirmPassword = "Passwords must match";
        setErrors(tempErrors);
        if (Object.keys(tempErrors).length === 0) {
            // Submit form or continue
            console.log('Form submitted:', signUpValues);
            // Reset form
            setSignUpValues({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                phoneNumber: '',
                countryCode: '+1',
                birthDay: '',
                birthMonth: '',
                birthYear: '',
                verificationCode: '', // Reset verification code
            });
            router.push('/dashboard');
            setErrors({});

        }
        signup(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, signUpValues.verificationCode)
            .then(response => {
                console.log('Signup was:', response);
            })
    }



    const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        if (!val) return;
        const newCode = [...verificationCode];
        newCode[idx] = val[0];
        setVerificationCode(newCode);
        if (idx < 5 && val) {
            inputRefs.current[idx + 1]?.focus();
        }
        if (idx === 5 && val) {
            const enteredCode = newCode.join("");
            console.log('Entered Code:', enteredCode);
            signUpValues.verificationCode = enteredCode;
            signup(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, enteredCode)
                .then(async response => {
                    console.log('Signup was:', response);
                    if (response.message !== 'Email verified successfully!') {
                        setErrors(prev => ({ ...prev, verificationCode: "Incorrect Code. Please try again." }));
                    } else {
                        setErrors(prev => ({ ...prev, verificationCode: undefined }));
                        setCurrentStep(3);
                        if (timerRef.current) clearInterval(timerRef.current);
                        if (timer2Ref.current) clearInterval(timer2Ref.current);
                    }
                })

        } else {
            // Clear error if editing before last digit
            setErrors(prev => ({ ...prev, verificationCode: undefined }));
        }
    };

    const handleVerificationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === "Backspace") {
            if (verificationCode[idx]) {
                const newCode = [...verificationCode];
                newCode[idx] = "";
                setVerificationCode(newCode);
            } else if (idx > 0) {
                inputRefs.current[idx - 1]?.focus();
                const newCode = [...verificationCode];
                newCode[idx - 1] = "";
                setVerificationCode(newCode);
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        } else if (e.key === "ArrowRight" && idx < 5) {
            inputRefs.current[idx + 1]?.focus();
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep === 1) {
            // Basic email validation
            if (!signUpValues.email.trim() || !/\S+@\S+\.\S+/.test(signUpValues.email)) {
                setErrors({ email: "Please enter a valid email address" });
                return;
            }
            setErrors({});
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Verification code validation
            const enteredCode = verificationCode.join('');
            if (enteredCode !== "333333") {
                setErrors(prev => {
                    const newErrors = { ...prev, verificationCode: "Incorrect Code. Please try again" };
                    return newErrors;
                });
                return;
            }
            setErrors(prev => ({ ...prev, verificationCode: undefined }));
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // 3rd step: Validate first name, last name, password, confirm password
            let tempErrors: FormErrors = {};
            if (!signUpValues.firstName.trim()) tempErrors.firstName = "First name is required";
            if (!signUpValues.lastName.trim()) tempErrors.lastName = "Last name is required";
            if (!signUpValues.password.trim()) tempErrors.password = "Password is required";
            else if (signUpValues.password.length < 8) tempErrors.password = "Password must be at least 8 characters";
            if (!signUpValues.confirmPassword.trim()) tempErrors.confirmPassword = "Confirm password is required";
            else if (signUpValues.password !== signUpValues.confirmPassword) tempErrors.confirmPassword = "Passwords must match";
            setErrors(tempErrors);
            if (Object.keys(tempErrors).length === 0) {
                // Submit form or continue
                console.log('Form submitted:', signUpValues);
                // Reset form
                setSignUpValues({
                    firstName: '',
                    lastName: '',
                    email: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    phoneNumber: '',
                    countryCode: '+1',
                    birthDay: '',
                    birthMonth: '',
                    birthYear: '',
                    verificationCode: '', // Reset verification code
                });
                router.push('/');
                setErrors({});

            }
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setErrors({});
    };

    return (
        <>
            <div className="login-container">
                {/* Site Logo */}
                <Link href="/" className="login-site-logo">
                    Flourish
                    <FaLightbulb />
                </Link>

                {/* Top Right Buttons */}
                <div className="login-top-buttons">
                    <Link href="/contactUs" className="contact-us-btn">Contact Us</Link>
                    <Link href="/login" className="sign-up-btn">Log In</Link>
                </div>

                {/* Sign Up Content */}
                <div className="login-content">
                    <FormCard
                        title={currentStep === 2 ? "Verification" : "Create an Account"}
                        onSubmit={handleSubmit}
                        style={{ width: '468px', marginBottom: '9rem' }}
                        showSubmitButton={false}
                    >
                        {currentStep === 1 ? (
                            <>
                                {/* Social Login Buttons */}
                                <button type="button" className="social-login-btn google-btn">
                                    <FaGoogle className="google-icon" /> Sign up with Google
                                </button>
                                <button type="button" className="social-login-btn sso-btn" style={{ background: "#181c23", color: "#fff", border: "1.5px solid #222" }}>
                                    <FaGraduationCap className="sso-icon" /> Sign up with School SSO
                                </button>
                                {/* Separator */}
                                <div className="login-or-separator">
                                    <span>or</span>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={signUpValues.email}
                                        onChange={handleChange}
                                        className={errors.email ? "error" : ""}
                                        placeholder="Email"
                                    />
                                    {errors.email && <div className="error-message">{errors.email}</div>}
                                </div>
                                <button onClick={handleVerificationCode} type="submit" className="email-continue-btn">
                                    <FaEnvelope />
                                    Continue with Email
                                </button>
                            </>
                        ) : currentStep === 2 ? (
                            <div style={{ marginTop: '-1rem' }}>
                                <p style={{
                                    textAlign: 'center',
                                    color: '#b0b8c1',
                                    marginBottom: '1.2rem',
                                    fontSize: '1.05rem',
                                    fontWeight: 400,
                                    opacity: 1
                                }}>
                                    If you have an account, we have sent a code to <b style={{ color: '#fff', fontWeight: 500 }}>{signUpValues.email}</b>. Enter it below.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                                    {verificationCode.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            className={`verification-digit-input ${errors.verificationCode ? 'error' : ''}`}
                                            ref={el => { inputRefs.current[idx] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onFocus={() => handleVerificationFocus(idx)}
                                            onBlur={handleVerificationBlur}
                                            onChange={e => handleVerificationChange(e, idx)}
                                            onKeyDown={e => handleVerificationKeyDown(e, idx)}
                                            style={{
                                                textAlign: 'center',
                                                border: `2px solid ${focusedIndex === idx ? '#fff' : errors.verificationCode ? '#ff3860' : '#888'}`,
                                                borderRadius: '8px',
                                                background: '#0B0809',
                                                color: '#fff',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                                fontWeight: 500,
                                                boxSizing: 'border-box',
                                                padding: 0
                                            }}
                                        />
                                    ))}
                                </div>
                                {currentStep === 2 && errors.verificationCode && (
                                    <div className="error-message" style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', justifyContent: 'center', gap: '8px', margin: '-0.5rem 0 1rem 0', textAlign: 'center' }}>
                                        <FaExclamationCircle style={{ margin: 0, fontSize: '1.3rem', verticalAlign: 'middle' }} />
                                        <span style={{ verticalAlign: 'middle' }}>{errors.verificationCode}</span>
                                    </div>
                                )}
                                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#b0b8c1' }}>
                                    {timer > 0 ? (
                                        <span>Resend code in {timer}s</span>
                                    ) : (
                                        <button
                                            onClick={handleVerificationCode}
                                            type="button"
                                            className="bg-white text-black border border-gray-300 rounded-lg px-4 !mb-10 font-semibold hover:bg-gray-100 transition-colors"
                                            style={{ width: '100%' }}
                                        >
                                            Resend Code
                                        </button>
                                    )}
                                </div>
                                <div className="signup-back-link">
                                    <a href="#" style={{ color: '#1f98f4', textDecoration: 'none', fontWeight: 500, }} onClick={e => { e.preventDefault(); setCurrentStep(1); }}>
                                        &larr; Back
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="signup-fields-group">
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={signUpValues.firstName}
                                                onChange={handleChange}
                                                className={errors.firstName ? "error" : ""}
                                                placeholder="First Name"
                                            />
                                            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={signUpValues.lastName}
                                                onChange={handleChange}
                                                className={errors.lastName ? "error" : ""}
                                                placeholder="Last Name"
                                            />
                                            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="login-password-field">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={signUpValues.password}
                                                onChange={handleChange}
                                                className={errors.password ? "error" : ""}
                                                placeholder="Password"
                                            />
                                            <span className="login-password-toggle" onClick={togglePasswordVisibility}>
                                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                        {errors.password && <div className="error-message">{errors.password}</div>}
                                    </div>
                                    <div className="form-group">
                                        <div className="login-password-field">
                                            <input
                                                type={showPassword2 ? "text" : "password"}
                                                name="confirmPassword"
                                                value={signUpValues.confirmPassword}
                                                onChange={handleChange}
                                                className={errors.confirmPassword ? "error" : ""}
                                                placeholder="Confirm Password"
                                            />
                                            <span className="login-password-toggle" onClick={togglePasswordVisibility2}>
                                                {showPassword2 ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignUp}
                                    type="submit"
                                    style={{
                                        background: "#fff",
                                        color: "#0B0809",
                                        border: "1px solid #2f3542",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        transition: "none"
                                    }}
                                >
                                    Create Account
                                </button>
                                <div className="signup-back-link">
                                    <a href="#" style={{ color: '#1f98f4', textDecoration: 'none', fontWeight: 500 }} onClick={e => { e.preventDefault(); setCurrentStep(1); }}>
                                        &larr; Back
                                    </a>
                                </div>
                            </>
                        )}
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

                    {/* Separator and Login Link */}
                    <div className="login-separator-section">
                        <div className="login-separator" />
                        <div className="login-bottom-text">
                            <span>
                                Already have an account?{" "}
                                <Link href="/login">
                                    Login
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

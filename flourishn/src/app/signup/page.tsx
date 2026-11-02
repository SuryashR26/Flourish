'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import "@/styles/login.css";
// import { FaLightbulb } from 'react-icons/fa';
import { FaEye, FaEyeSlash, FaGoogle, FaGraduationCap, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import FormCard from "@/components/cards/formCards";
import { useUser } from "@/context/UserContext";
import FlourishLogo from "@/components/ui/FlourishLogo";

// import { sign } from 'crypto';
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

    // const [dayValue, setDayValue] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [firstTime, setFirstTime] = useState(false)

    const { signUp, isLoggedIn } = useUser();



    useEffect(() => {
        if (isLoggedIn) {
            console.log("User is already logged in, redirecting to dashboard");
            if (firstTime) {
                localStorage.setItem("firstTimeSignUp", "true");
                router.push("/dashboard");
            } else {
                router.push('/dashboard');
            }
        }
    }, [isLoggedIn, router]);

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

    /*const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
   */

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

    const handleVerificationCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUpValues.email.trim() || !/\S+@\S+\.\S+/.test(signUpValues.email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }
        setErrors({});
        const message = await signUp(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, '')
        if (message && message.includes("Email")) {
            setErrors(prev => ({ ...prev, email: message }));

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

        }
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        const tempErrors: FormErrors = {};
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

            router.push("/dashboard?firstTimeSignUp=true");
            setErrors({});

            signUp(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, signUpValues.verificationCode)


        }
    }



    const handleVerificationChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
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
            setSignUpValues(prev => ({ ...prev, verificationCode: enteredCode }));
            const message2 = await signUp(signUpValues.email, signUpValues.firstName, signUpValues.lastName, signUpValues.password, enteredCode)
            if (message2 && message2 !== 'Email verified successfully!') {
                setErrors(prev => ({ ...prev, verificationCode: "Incorrect Code. Please try again." }));
            } else {
                setErrors(prev => ({ ...prev, verificationCode: undefined }));
                setFirstTime(true)
                setCurrentStep(3);
                if (timerRef.current) clearInterval(timerRef.current);

            }
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


    /* const handleSubmit = (e: React.FormEvent) => {
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
                     const newErrors = { ...prev, verificationCode: "Incorrect. Please try again" };
                     return newErrors;
                 });
                 return;
             }
             setErrors(prev => ({ ...prev, verificationCode: undefined }));
             setCurrentStep(3);
         } else if (currentStep === 3) {
             // 3rd step: Validate first name, last name, password, confirm password
             const tempErrors: FormErrors = {};
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
     */

    /* const handleBack = () => {
         setCurrentStep(1);
         setErrors({});
     };
     */

    return (
        <>
            <div className="login-container">
                {/* Site Logo */}
                <Link href="/" className="login-site-logo">
                    Flourish Board
                    {/* <FaLightbulb /> */}
                    <FlourishLogo />
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
                        style={{ width: '468px', marginBottom: '9rem' }}
                        showSubmitButton={false}
                        onSubmit={() => { }}
                    >
                        {currentStep === 1 ? (
                            <>
                                {/* Social Login Buttons */}
                                <button type="button" className="social-login-btn google-btn">
                                    <FaGoogle className="google-icon" /> Sign up with Google
                                </button>
                                <button type="button" className="social-login-btn sso-btn" style={{ background: "#eef0f3", color: "#14171c", border: "1.5px solid #e5e7eb" }}>
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
                                <button onClick={handleVerificationCode} type="button" className="email-continue-btn">
                                    <FaEnvelope />
                                    Continue with Email
                                </button>
                            </>
                        ) : currentStep === 2 ? (
                            <div style={{ marginTop: '-1rem' }}>
                                <p className="verification-text" style={{
                                    textAlign: 'center',
                                    color: '#9aa3af',
                                    marginBottom: '1.2rem',
                                    fontSize: '1.05rem',
                                    fontWeight: 400,
                                    opacity: 1
                                }}>
                                    If you have an account, we have sent a code to <b style={{ color: '#14171c', fontWeight: 500 }}>{signUpValues.email}</b>. Enter it below.
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
                                                border: `2px solid ${focusedIndex === idx ? '#1f98f4' : errors.verificationCode ? '#ff3860' : '#6b7280'} `,
                                                borderRadius: '8px',
                                                background: '#f4f5f7',
                                                color: '#14171c',
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
                                <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#9aa3af' }}>
                                    {timer > 0 ? (
                                        <span>Resend code in {timer}s</span>
                                    ) : (
                                        <button
                                            onClick={handleVerificationCode}
                                            type="button"
                                            className="bg-white text-black border border-gray-300 rounded-lg px-4 !mb-2 font-semibold hover:bg-gray-100 transition-colors"
                                            style={{ width: 'auto', minWidth: '200px' }}
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
                                    type="button"
                                    style={{
                                        background: "#fff",
                                        color: "#f4f5f7",
                                        border: "1px solid #e2e5ea",
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

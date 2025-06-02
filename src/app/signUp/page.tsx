'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/signUp.css';
import { FaEye, FaEyeSlash, FaLightbulb } from 'react-icons/fa';

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
    });

    const [dayValue, setDayValue] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

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

    const validateStep1 = () => {
        let tempErrors: FormErrors = {};

        if (!signUpValues.email) {
            tempErrors['email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(signUpValues.email)) {
            tempErrors['email'] = 'Email is invalid';
        }
        if (!signUpValues.username) tempErrors['username'] = 'Username is required';
        if (!signUpValues.password) {
            tempErrors['password'] = 'Password is required';
        } else if (signUpValues.password.length < 6) {
            tempErrors['password'] = 'Password must be at least 6 characters';
        }
        if (signUpValues.password !== signUpValues.confirmPassword) {
            tempErrors['confirmPassword'] = 'Passwords do not match';
        }
        if (signUpValues.phoneNumber && signUpValues.phoneNumber.length !== 12) {
            tempErrors['phoneNumber'] = 'Phone number must be 10 digits';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const validateStep2 = () => {
        let tempErrors: FormErrors = {};

        if (!signUpValues.firstName) tempErrors['firstName'] = 'First name is required';
        if (!signUpValues.lastName) tempErrors['lastName'] = 'Last name is required';
        if (!signUpValues.birthMonth) tempErrors['birthMonth'] = 'Birth month is required';
        if (!signUpValues.birthDay) tempErrors['birthDay'] = 'Birth day is required';
        if (!signUpValues.birthYear) tempErrors['birthYear'] = 'Birth year is required';

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
                setErrors({});
            }
        } else {
            if (validateStep2()) {
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
                });
                setCurrentStep(1);
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
            <Link href="/" className="site-logo">
                Flourish<FaLightbulb />
            </Link>
            <div className="signup-container">
                <div className="signup-form-card">
                    <h2>{currentStep === 1 ? 'Create Account' : 'Personal Information'}</h2>
                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 ? (
                            <>
                                <div className="form1-row">
                                    <div className="form-group full-width">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={signUpValues.username}
                                            onChange={handleChange}
                                            className={errors.username ? "error" : ""}
                                            placeholder="Choose a username"
                                        />
                                        {errors.username && <div className="error-message">{errors.username}</div>}
                                    </div>
                                </div>

                                <div className="form1-row">
                                    <div className="form-group full-width">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={signUpValues.email}
                                            onChange={handleChange}
                                            className={errors.email ? "error" : ""}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <div className="error-message">{errors.email}</div>}
                                    </div>
                                </div>

                                <div className="form1-row">
                                    <div className="form-group">
                                        <label>Password</label>
                                        <div className="password-field">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={signUpValues.password}
                                                onChange={handleChange}
                                                className={errors.password ? "error" : ""}
                                                placeholder="Enter your password"
                                            />
                                            <span
                                                className="password-toggle"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                        {errors.password && <div className="error-message">{errors.password}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <div className="password-field">
                                            <input
                                                type={showPassword2 ? "text" : "password"}
                                                name="confirmPassword"
                                                value={signUpValues.confirmPassword}
                                                onChange={handleChange}
                                                className={errors.confirmPassword ? "error" : ""}
                                                placeholder="Confirm your password"
                                            />
                                            <span
                                                className="password-toggle"
                                                onClick={togglePasswordVisibility2}
                                            >
                                                {showPassword2 ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                                    </div>
                                </div>

                                <div className="form1-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={signUpValues.phoneNumber}
                                            onChange={handleChange}
                                            className={errors.phoneNumber ? "error" : ""}
                                            placeholder="(Optional) Enter phone number"
                                        />
                                        {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form1-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={signUpValues.firstName}
                                            onChange={handleChange}
                                            className={errors.firstName ? "error" : ""}
                                            placeholder="Enter your first name"
                                        />
                                        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={signUpValues.lastName}
                                            onChange={handleChange}
                                            className={errors.lastName ? "error" : ""}
                                            placeholder="Enter your last name"
                                        />
                                        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                                    </div>
                                </div>

                                <div className="form1-row">
                                    <div className="form-group">
                                        <label>Birthday</label>
                                        <select
                                            name="birthMonth"
                                            value={signUpValues.birthMonth}
                                            onChange={handleDayChange}
                                            className={errors.birthMonth ? "error" : ""}
                                        >
                                            <option value="" disabled={signUpValues.birthMonth !== ""}>Select month</option>
                                            <option value="01">January</option>
                                            <option value="02">February</option>
                                            <option value="03">March</option>
                                            <option value="04">April</option>
                                            <option value="05">May</option>
                                            <option value="06">June</option>
                                            <option value="07">July</option>
                                            <option value="08">August</option>
                                            <option value="09">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                        {errors.birthMonth && <div className="error-message">{errors.birthMonth}</div>}
                                    </div>
                                    <div className="form-group">
                                        <select
                                            name="birthDay"
                                            value={signUpValues.birthDay}
                                            onChange={handleChange}
                                            className={errors.birthDay ? "error" : ""}
                                            style={{ marginTop: '29px' }}
                                            disabled={!signUpValues.birthMonth}
                                        >
                                            <option value="" disabled={signUpValues.birthDay !== ""}>Day</option>
                                            {(() => {
                                                const days = [];
                                                let maxDay = 31;
                                                if (dayValue === 2) maxDay = 30;
                                                else if (dayValue === 3) maxDay = 29;
                                                for (let i = 1; i <= maxDay; i++) {
                                                    const day = i < 10 ? `0${i}` : `${i}`;
                                                    days.push(
                                                        <option key={day} value={day}>{day}</option>
                                                    );
                                                }
                                                return days;
                                            })()}
                                        </select>
                                        {errors.birthDay && <div className="error-message">{errors.birthDay}</div>}
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="birthYear"
                                            value={signUpValues.birthYear}
                                            onChange={handleChange}
                                            maxLength={4}
                                            placeholder='YYYY'
                                            className={errors.birthYear ? "error" : ""}
                                            style={{ marginTop: '29px' }}
                                        />
                                        {errors.birthYear && <div className="error-message">{errors.birthYear}</div>}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="button-container">
                            {currentStep === 2 ? (
                                <div className="button-row">
                                    <button type="button" onClick={handleBack} className="back-button">
                                        Back
                                    </button>
                                    <button type="submit" className="submit-button">
                                        Sign Up
                                    </button>
                                </div>
                            ) : (
                                <button type="submit" className="next-button">
                                    Next
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

"use client"

import type React from "react"
import { useState } from "react"
import Footer from "@/components/layout/footer"
import FormCard from "@/components/cards/formCards"
import Navbar from "@/components/layout/navbar"

interface FormValues {
    firstName: string
    lastName: string
    email: string
    message: string
}

interface FormErrors {
    firstName?: string
    lastName?: string
    email?: string
    message?: string
}

export default function ContactUsPage() {
    const [formValues, setFormValues] = useState<FormValues>({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value,
        })
    }

    const validateForm = () => {
        let tempErrors: FormErrors = {};
        let isValid = true;

        if (!formValues.firstName.trim()) {
            tempErrors.firstName = "First name is required";
            isValid = false;
        }

        if (!formValues.lastName.trim()) {
            tempErrors.lastName = "Last name is required";
            isValid = false;
        }

        if (!formValues.email.trim()) {
            tempErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
            tempErrors.email = "Email address is invalid";
            isValid = false;
        }

        if (!formValues.message.trim()) {
            tempErrors.message = "Please enter your question";
            isValid = false;
        } else if (formValues.message.length < 10) {
            tempErrors.message = "Your message is too short (minimum 10 characters)";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            // Reset form after successful validation
            setFormValues({
                firstName: '',
                lastName: '',
                email: '',
                message: ''
            });
            setErrors({});
            console.log('Form submitted:', formValues);
            // Add your form submission logic here
        }
    };

    return (
        <div>
            <Navbar scrollThreshold={-10} />
            <div className="relative h-screen flex justify-center items-center">
                <img
                    src="/images/contactUs.jpg"
                    alt="Background"
                    className="absolute top-0 left-0 w-full h-full object-cover -z-10"
                />
                <div className="absolute top-[55%] right-[15%] -translate-y-1/2 max-w-[450px]">
                    <FormCard title="Contact Us" onSubmit={handleSubmit}>
                        <FormCard.Row>
                            <div>
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    className={`${errors.firstName ? "!border-red-500" : ""}`}
                                />
                                {errors.firstName &&
                                    <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
                                }
                            </div>
                            <div>
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    className={`${errors.lastName ? "!border-red-500" : ""}`}
                                />
                                {errors.lastName &&
                                    <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
                                }
                            </div>
                        </FormCard.Row>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleChange}
                                className={`${errors.email ? "!border-red-500" : ""}`}
                            />
                            {errors.email &&
                                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                            }
                        </div>
                        <div>
                            <label>What is your question?</label>
                            <textarea
                                name="message"
                                value={formValues.message}
                                onChange={handleChange}
                                maxLength={350}
                                rows={5}
                                placeholder="Maximum 350 characters"
                                className={`${errors.message ? "!border-red-500" : ""}`}
                            />
                            {errors.message &&
                                <div className="text-red-500 text-sm mt-1">{errors.message}</div>
                            }
                            <div className="text-sm text-gray-400 text-right mt-1">
                                {formValues.message.length}/350 characters
                            </div>
                        </div>
                        <button type="submit">Submit</button>
                    </FormCard>
                </div>
            </div>
            <Footer />
        </div>
    )
}

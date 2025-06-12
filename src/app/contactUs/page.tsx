"use client"

import type React from "react"
import { useState } from "react"
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
            <div className="relative min-h-[110vh] flex justify-center items-center"> {/* Changed from 120vh to 110vh */}
                <img
                    src="/images/contactUs.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover -z-10"
                />
                <div className="absolute top-[52%] right-[15%] -translate-y-1/2 w-[500px]"> {/* Adjusted top position */}
                    <FormCard title="Contact Us" onSubmit={handleSubmit}>
                        <FormCard.Row className="flex gap-4 mb-2 w-full">
                            <div className="flex-1 min-w-0"> {/* Changed min-w-0 to allow flex shrinking */}
                                <label className="text-sm mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    className={`w-full ${errors.firstName ? "!border-red-500" : ""}`}
                                />
                                {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                            </div>
                            <div className="flex-1 min-w-0"> {/* Changed min-w-0 to allow flex shrinking */}
                                <label className="text-sm mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    className={`w-full ${errors.lastName ? "!border-red-500" : ""}`}
                                />
                                {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                            </div>
                        </FormCard.Row>
                        <div className="mb-1"> {/* Reduced from mb-2 */}
                            <label className="text-sm mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleChange}
                                className={`${errors.email ? "!border-red-500" : ""}`}
                            />
                            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        <div className="mb-1"> {/* Reduced from mb-2 */}
                            <label className="text-sm mb-1">What is your question?</label>
                            <textarea
                                name="message"
                                value={formValues.message}
                                onChange={handleChange}
                                maxLength={350}
                                rows={4}
                                style={{ minHeight: '100px', height: '100px' }}  // Increased height
                                className={`w-full p-2 rounded-md border ${errors.message ? "!border-red-500" : "border-gray-300"} bg-[#181c23] text-white resize-none`}
                                placeholder="Maximum 350 characters"
                            />
                            {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                            <div className="text-xs text-gray-400 text-right mt-0.5">
                                {formValues.message.length}/350
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mt-2"
                        >
                            Submit
                        </button>
                    </FormCard>
                </div>
            </div>
        </div>
    )
}

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
        // Clear the error for the field being edited
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: undefined,
        }))
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
            <div className="min-h-[110vh] flex justify-center items-center bg-black"> {/* Set background to black and center form */}
                <div className="w-[500px] flex justify-center items-center"> {/* Center the form */}
                    <FormCard title="Contact Us" onSubmit={handleSubmit} buttonClassName="w-full py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors mt-2 font-semibold" submitLabel="Submit" showSubmitButton={true}>
                        <FormCard.Row className="flex gap-4 mb-2 w-full">
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className={`w-full ${errors.firstName ? "!border-[#ff3860]" : ""}`}
                                />
                                {errors.firstName && <div className="contact-error-message contact-error-firstName text-red-500 text-xs mt-1">{errors.firstName}</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className={`w-full ${errors.lastName ? "!border-[#ff3860]" : ""}`}
                                />
                                {errors.lastName && <div className="contact-error-message contact-error-lastName text-red-500 text-xs mt-1">{errors.lastName}</div>}
                            </div>
                        </FormCard.Row>
                        <div className="mb-1">
                            <input
                                type="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={`${errors.email ? "!border-[#ff3860]" : ""}`}
                            />
                            {errors.email && <div className="contact-error-message contact-error-email text-red-500 text-xs mt-1">{errors.email}</div>}
                        </div>
                        <div className="mb-1">
                            <textarea
                                name="message"
                                value={formValues.message}
                                onChange={handleChange}
                                maxLength={350}
                                rows={4}
                                style={{ minHeight: '100px', height: '100px' }}
                                className={`w-full p-2 rounded-md border ${errors.message ? "!border-[#ff3860]" : "border-gray-300"} bg-[#181c23] text-white resize-none`}
                                placeholder="What is your question? (Maximum 350 characters)"
                            />
                            {errors.message && <div className="contact-error-message contact-error-messageField text-red-500 text-xs mt-1">{errors.message}</div>}
                            <div className="text-xs text-gray-400 text-right mt-0.5">
                                {formValues.message.length}/350
                            </div>
                        </div>
                    </FormCard>
                </div>
            </div>
        </div>
    )
}

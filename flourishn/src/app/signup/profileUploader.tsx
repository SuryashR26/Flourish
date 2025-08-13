'use client'

import { useState, useEffect } from 'react';
import { getPresignedUrl } from '@/api/apiClient';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import { setCookie } from '@/utils/cookies';
import dynamic from "next/dynamic"
import { components } from "react-select"
import { SignUpValues2 } from '@/app/types/projectTypes';
import { additionalInfo } from "@/api/apiClient"

import type { CSSObjectWithLabel, ControlProps, MultiValueRemoveProps, OptionProps } from 'react-select';



interface FormErrors {
    firstName?: string
    lastName?: string
    email?: string
    message?: string
    birthday?: string
    phoneNumber?: string
}

export default function ProfileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const { user, setUser } = useUser();
    const [submitPhoto, setSubmitPhoto] = useState(false);


    const [signUpValues, setSignUpValues] = useState<SignUpValues2>({
        birthday: '',
        phoneNumber: '',
        interest: []
    });



    const customSelectStyles = {
        control: (provided: CSSObjectWithLabel, state: ControlProps<any, true>): CSSObjectWithLabel => ({
            ...provided,
            backgroundColor: '#0B0809',
            border: state.isFocused ? '1px solid #1f98f4' : '1px solid #2f3542',
            borderRadius: 8,
            color: 'white',
            fontWeight: 400,
            minHeight: 48,
            boxShadow: 'none',
            flexWrap: 'wrap',
            '&:hover': {
                border: state.isFocused ? '1px solid #1f98f4' : '1px solid #2f3542',
            },
        }),
        menu: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            backgroundColor: '#0B0809',
            color: 'white',
            border: '1px solid #2f3542',
            borderRadius: 8,
            zIndex: 20,
        }),
        option: (provided: CSSObjectWithLabel, state: OptionProps<any, true>): CSSObjectWithLabel => ({
            ...provided,
            backgroundColor: state.isFocused ? '#181c23' : '#0B0809',
            color: 'white',
            fontWeight: 400,
            cursor: 'pointer',
        }),
        input: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            color: 'white',
            fontWeight: 400,
        }),
        multiValue: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            backgroundColor: '#181c23',
            color: 'white',
            borderRadius: 8,
            minHeight: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            fontSize: 18,
            paddingLeft: 8,
            paddingRight: 8,
            marginTop: 4,
            marginBottom: 4,
        }),
        multiValueLabel: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            color: 'white',
            fontWeight: 400,
            fontSize: 14,
            paddingRight: 5,
            display: 'flex',
            alignItems: 'center',
        }),
        multiValueRemove: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            color: 'white',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            ':hover': {
                backgroundColor: '#2f3542',
                color: 'white',
            },
        }),
        placeholder: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
            ...provided,
            color: '#b0b8c1',
            fontWeight: 400,
        }),
    };

    const CustomMultiValueRemove = (props: MultiValueRemoveProps<any>) => (
        <components.MultiValueRemove {...props}>
            <svg
                width={20} height={20} viewBox="0 0 24 24"
                style={{ display: "block" }}
                aria-hidden="true"
                focusable="false"
            >
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" />
                <line x1="6" y1="18" x2="18" y2="6" stroke="white" strokeWidth="2" />
            </svg>
        </components.MultiValueRemove>
    );


    const [errors, setErrors] = useState<FormErrors>({});
    const [isOpen, setIsOpen] = useState(true);

    const Select = dynamic(() => import("react-select"), { ssr: false });

    const TAG_DIRECTORY = [
        { value: "Web Development", label: "Web Development" },
        { value: "JavaScript", label: "JavaScript" },
        { value: "React", label: "React" },
        { value: "Node.js", label: "Node.js" },
        { value: "UI Design", label: "UI Design" },
        { value: "TypeScript", label: "TypeScript" },
        { value: "Python", label: "Python" },
        // ...add more as needed
    ]
    const SKILL_DIRECTORY = [
        { value: "React", label: "React" },
        { value: "Node.js", label: "Node.js" },
        { value: "UI Design", label: "UI Design" },
        { value: "TypeScript", label: "TypeScript" },
        { value: "Python", label: "Python" },
        // ...add more as needed
    ]


    // Disable scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        if (submitPhoto) {
            uploadFile(selected);
        }
    };


    const uploadFile = async (selected: File) => {
        try {
            const { new_url, publicUrl } = await getPresignedUrl(selected.name, selected.type);

            const uploadRes = await fetch(new_url, {
                method: 'PUT',
                headers: { 'Content-Type': selected.type },
                body: selected,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            if (user) {
                const updatedUser = { ...user, profileurl: publicUrl };
                setUser(updatedUser);
                setCookie('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };


    const handleSubmit = async (): Promise<boolean> => {
        if (errors.birthday || errors.phoneNumber) {
            return false;
        }

        if (signUpValues.birthday === '') {
            setErrors(prev => ({
                ...prev,
                birthday: 'Please set a birthday',
            }));
            return false;
        }

        try {
            await additionalInfo(signUpValues);
            setSubmitPhoto(true);
            if (file) {
                await uploadFile(file);
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const onSubmit = async () => {
        const success = await handleSubmit();
        if (success) {
            handleClose();
        }
    };




    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ['birthDay', 'birthMonth', 'birthYear'];


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
        } else if (name === 'birthday') {

            if (value) {
                const birthDate = new Date(value);
                const today = new Date();
                const birthYear = birthDate.getFullYear();
                const currentYear = today.getFullYear();


                if (birthYear < 1900) {
                    setErrors(prev => ({
                        ...prev,
                        [name]: 'Please enter a valid birth year (1900 or later)'
                    }));
                } else if (birthYear > currentYear) {
                    setErrors(prev => ({
                        ...prev,
                        [name]: 'Birth year cannot be in the future'
                    }));
                } else {
                    // Check age if year is valid
                    const age = currentYear - birthYear;
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    const dayDiff = today.getDate() - birthDate.getDate();


                    const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

                    if (actualAge < 13) {
                        setErrors(prev => ({
                            ...prev,
                            [name]: 'You must be at least 13 years old to use this service'
                        }));
                    }
                }
            }

            setSignUpValues(prev => ({
                ...prev,
                [name]: value
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

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop blur overlay */}
            <div
                className="absolute inset-0 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal content */}
            <div className="relative z-10 w-full max-w-2xl mx-6">
                {/* Header with close button */}
                <div className="bg-gray-800 rounded-t-3xl px-16 pt-12 pb-8 relative">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-8 right-8 w-12 h-12 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-xl" />
                    </button>

                    <div className="text-center pr-16">
                        <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
                        <p className="text-gray-400 text-lg">Add your photo and details</p>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-b-3xl px-16 py-12 shadow-2xl">
                    {/* Profile Photo Circle */}
                    <div className="flex justify-center mb-12">
                        <div className="relative">
                            <input
                                type="file"
                                id="fileInput"
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                            />
                            <label
                                htmlFor="fileInput"
                                className="flex items-center justify-center w-36 h-36 bg-gray-700 rounded-full border-3 border-dashed border-gray-500 hover:border-blue-400 hover:bg-gray-600 cursor-pointer transition-all duration-200 group shadow-lg"
                                title="Upload profile photo"
                            >
                                {file ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Profile preview"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <FaPlus className="text-white text-4xl group-hover:text-blue-400 transition-colors" />
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Choose Photo Text */}
                    <div className="text-center mb-12">
                        <p className="text-gray-300 text-lg font-medium">
                            {file ? 'Photo selected' : 'Choose photo'}
                        </p>
                        {file && (
                            <p className="text-gray-500 text-base mt-3">{file.name}</p>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-10">
                        {/* Birthday Field */}
                        <div>
                            <label htmlFor="birthday" className="block text-lg font-semibold text-gray-200 mb-4">
                                Birthday
                            </label>
                            <input
                                type="date"
                                id="birthday"
                                name="birthday"
                                value={signUpValues.birthday}
                                onChange={handleChange}
                                className={`w-full p-2 rounded-md border bg-[#181c23] text-white focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.birthday ? "!border-[#ff3860]" : "border-gray-300"}`}
                            />
                            {errors.birthday && <div className="contact-error-message contact-error-birthday text-red-500 text-xs mt-1">{errors.birthday}</div>}
                        </div>

                        {/* Phone Number Field */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-lg font-semibold text-gray-200 mb-4">
                                Phone Number <span className="text-gray-500 font-normal text-base">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={signUpValues.phoneNumber}
                                onChange={handleChange}
                                placeholder="123-456-7890"
                                className={`w-full p-2 rounded-md border bg-[#181c23] text-white focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.phoneNumber ? "!border-[#ff3860]" : "border-gray-300"}`}
                            />
                            {errors.phoneNumber && <div className="contact-error-message contact-error-phoneNumber text-red-500 text-xs mt-1">{errors.phoneNumber}</div>}
                        </div>
                    </div>
                    <div className="filter-section !mb-6 !mt-10">
                        <div className={`filter-content !pl-2`}>
                            <div className="tags-container relative">
                                <Select
                                    isMulti
                                    options={SKILL_DIRECTORY}
                                    value={signUpValues.interest.map(interest => ({ value: interest, label: interest }))}
                                    onChange={selected => {
                                        // selected is array of {value,label}
                                        const interest = (selected as { value: string; label: string }[]).map(option => option.value).slice(0, 5);
                                        setSignUpValues({ ...signUpValues, interest });
                                    }}
                                    placeholder="Search skills..."
                                    closeMenuOnSelect={false}
                                    isClearable
                                    styles={customSelectStyles}
                                    components={{ MultiValueRemove: CustomMultiValueRemove }}
                                    noOptionsMessage={() => null}
                                    className="tags-input !w-full !py-2.5 !px-3 !bg-[#0B0809] !border !border-[#2f3542] !rounded-lg !text-white !text-[14px] !mb-2 cursor-pointer"
                                />
                                <div className="selected-tags flex flex-wrap !gap-1 !mt-2 !mb-2">
                                    {signUpValues.interest.map((interest, i) => (
                                        <span key={i} className="tag-chip !bg-[#181c23] !text-white !px-2 !py-1 !rounded !text-[12px] flex items-center !gap-1">
                                            {interest}
                                            <span
                                                className="tag-remove !text-[#888] !text-[14px] cursor-pointer hover:!text-white"
                                                onClick={() => {
                                                    const interestArr = [...signUpValues.interest];
                                                    interestArr.splice(i, 1);
                                                    setSignUpValues({ ...signUpValues, interest: interestArr });
                                                }}
                                            >
                                                ×
                                            </span>
                                        </span>
                                    ))}
                                </div>
                                <div className="tag-limit !text-[11px] !text-[#666] !mt-1">
                                    {signUpValues.interest.length}/5 skills selected
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Submit Button */}
                    <button className="w-full mt-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-xl shadow-xl hover:shadow-2xl hover:scale-105 transform"
                        onClick={onSubmit}
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
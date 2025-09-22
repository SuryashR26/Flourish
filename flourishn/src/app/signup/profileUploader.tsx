'use client'

import { useState, useEffect } from 'react';
import { getPresignedUrl } from '@/api/apiClient';
import { FaPlus, FaTimes, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import { setCookie } from '@/utils/cookies';

import { components } from "react-select"
import { SignUpValues2 } from '@/app/types/projectTypes';
import { additionalInfo, skillDirectory } from "@/api/apiClient"

import AsyncSelect from "react-select/async";
import type { GroupBase, StylesConfig } from "react-select"
import { advancedSkills } from "../types/projectCategory"
import type { CSSObjectWithLabel, ControlProps, MultiValueRemoveProps, OptionProps } from 'react-select';


type OptionType = {
    value: string;
    label: string;
};


interface FormErrors {
    firstName?: string
    lastName?: string
    email?: string
    message?: string
    birthday?: string
    phoneNumber?: string
    interest?: string
}

type SkillOption = {
    value: string
    label: string
}


export default function ProfileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const { user, setUser } = useUser();
    const [currentStep, setCurrentStep] = useState(1);


    const [signUpValues, setSignUpValues] = useState<SignUpValues2>({
        birthday: '',
        phoneNumber: '',
        interest: [],
        displayName: '',
    });


    const customSelectStyles: StylesConfig<OptionType, true> = {
        control: (provided: CSSObjectWithLabel, state: ControlProps<OptionType, true>) => ({
            ...provided,
            backgroundColor: '#1f2937',
            border: state.isFocused ? '2px solid #0EA5E9' : '1px solid #374151',
            borderRadius: 8,
            color: 'white',
            fontWeight: 400,
            minHeight: 48,
            boxShadow: 'none',
            flexWrap: 'wrap',
            '&:hover': {
                border: state.isFocused ? '2px solid #0EA5E9' : '1px solid #4b5563',
            },
        }),
        option: (provided: CSSObjectWithLabel, state: OptionProps<OptionType, true>) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#374151' : '#1f2937',
            color: 'white',
            fontWeight: 400,
            cursor: 'pointer',
            '&:hover': { backgroundColor: '#374151' },
        }),
        input: (provided: CSSObjectWithLabel) => ({ ...provided, color: 'white', fontWeight: 400 }),
        multiValue: (provided: CSSObjectWithLabel) => ({ ...provided, backgroundColor: '#0EA5E9', color: 'white', borderRadius: 16, minHeight: 28, height: 28, display: 'flex', alignItems: 'center', fontSize: 14, paddingLeft: 8, paddingRight: 4, marginTop: 2, marginBottom: 2 }),
        multiValueLabel: (provided: CSSObjectWithLabel) => ({ ...provided, color: 'white', fontWeight: 400, fontSize: 13, paddingRight: 4, display: 'flex', alignItems: 'center' }),
        multiValueRemove: (provided: CSSObjectWithLabel) => ({ ...provided, color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', paddingLeft: 4, paddingRight: 4, ':hover': { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%' } }),
        placeholder: (provided: CSSObjectWithLabel) => ({ ...provided, color: '#9ca3af', fontWeight: 400 }),
    };

    const CustomMultiValueRemove = (props: MultiValueRemoveProps<OptionType, true, GroupBase<OptionType>>) => (
        <components.MultiValueRemove {...props}>
            <svg width={14} height={14} viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden="true" focusable="false">
                <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" />
                <line x1="6" y1="18" x2="18" y2="6" stroke="white" strokeWidth="2" />
            </svg>
        </components.MultiValueRemove>
    );


    const [errors, setErrors] = useState<FormErrors>({});
    const [isOpen, setIsOpen] = useState(true);



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        setFile(selected);
    };

    const handleSkillTags = async (inputValue: string) => {
        if (!inputValue || inputValue.length < 2) return [];
        try {

            const localMatches = advancedSkills.filter(cat =>
                cat.label.toLowerCase().includes(inputValue.toLowerCase())
            );


            const escoResults: SkillOption[] = await skillDirectory(inputValue);

            const merged: SkillOption[] = [...localMatches];

            escoResults.forEach((esco) => {
                if (!merged.some(local => local.label === esco.label)) {
                    merged.push(esco);
                }
            });


            return merged.slice(0, 10);
        } catch (error) {
            console.error("Error fetching tags:", error);
            return [];
        }
    };


    const uploadFile = async (selected: File, interests: string[]) => {
        try {
            const { new_url, publicUrl } = await getPresignedUrl(selected.name, selected.type);

            const uploadRes = await fetch(new_url, {
                method: 'PUT',
                headers: { 'Content-Type': selected.type },
                body: selected,
            });

            if (!uploadRes.ok) throw new Error('Upload failed');

            console.log(signUpValues.interest)

            if (user) {
                const updatedUser = {
                    ...user,
                    profileurl: publicUrl,
                    personal_preferences: [...interests]
                };
                setUser(updatedUser);
                setCookie('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    const uploadInterest = (interests: string[]) => {
        if (user) {
            const updatedUser = {
                ...user,
                personal_preferences: [...interests]
            };
            setUser(updatedUser);
            setCookie('user', JSON.stringify(updatedUser));
        }
    }


    const handleSubmit = async (): Promise<boolean> => {
        if (errors.birthday || errors.phoneNumber || errors.interest) {
            return false;
        }

        if (signUpValues.birthday === '') {
            setErrors(prev => ({
                ...prev,
                birthday: 'Please set a birthday',
            }));
            return false;
        }


        if (signUpValues.interest.length === 0) {
            setErrors(prev => ({
                ...prev,
                interest: 'Please add at least one interest or skill',
            }));
            return false;
        }

        try {
            await additionalInfo(signUpValues);
            if (file) {
                await uploadFile(file, signUpValues.interest);
                return true;
            }
            if (signUpValues.interest) {
                uploadInterest(signUpValues.interest)
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

    const handleNext = () => {

        if (signUpValues.birthday === '') {
            setErrors(prev => ({
                ...prev,
                birthday: 'Please set a birthday',
            }));
            return false;
        }
       
        if (signUpValues.phoneNumber?.length > 0 && signUpValues.phoneNumber.length < 10) {
            setErrors(prev => ({
                ...prev,
                phoneNumber: 'Please finish your phone number',
            }));
            return false;
        }
        if (errors.birthday || errors.phoneNumber ) {
            return false;
        }
        setCurrentStep(2);
    };

    const handlePrevious = () => {
        setCurrentStep(1);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />


            <div className="relative w-full max-w-2xl bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 bg-black">
                    {/*<button
                        onClick={handleClose}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-sm" />
                    </button>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center !mb-3 !mt-3">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= 1 ? 'bg-[#0EA5E9] text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {currentStep > 1 ? <FaCheck className="text-xs" /> : '1'}
                            </div>
                            <div className={`w-12 h-0.5 transition-all duration-300 ${currentStep >= 2 ? 'bg-[#0EA5E9]' : 'bg-gray-700'
                                }`} />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= 2 ? 'bg-[#0EA5E9] text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                2
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
                        <p className="text-gray-400">
                            {currentStep === 1 ? 'Personal Information' : 'Skills & Photo'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8 min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="!space-y-6 !ml-3 !mr-3">
                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 !mb-2">
                                    Display Name
                                    <span className="text-gray-500 font-normal ml-1">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={signUpValues.displayName}
                                    onChange={handleChange}
                                    maxLength={100}
                                    placeholder="Your Display Name"
                                    className="w-full !px-4 !py-3 bg-gray-800 border border-gray-700 rounded-lg !text-white !placeholder-gray focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Birthday */}
                            <div>
                                <label className="!block text-sm !font-medium text-gray-300 !mb-2">
                                    Birthday
                                </label>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={signUpValues.birthday}
                                    onChange={handleChange}
                                    className={`w-full !px-4 !py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all duration-200 ${errors.birthday ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                />
                                {errors.birthday && (
                                    <p className="text-red-400 text-sm mt-2">{errors.birthday}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 !mb-2">
                                    Phone Number
                                    <span className="text-gray-500 font-normal ml-1">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={signUpValues.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="123-456-7890"
                                    className={`w-full !px-4 !py-3 bg-gray-800 border rounded-lg text-white !placeholder-gray focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all duration-200 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                />
                                {errors.phoneNumber && (
                                    <p className="text-red-400 text-sm mt-2">{errors.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="!space-y-8">
                            {/* Profile Photo */}
                            <div className="text-center !mt-5">
                                <label className="block text-sm font-medium text-gray-300 !mb-3">
                                    Profile Photo
                                </label>
                                <div className="flex justify-center">
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
                                            className="flex items-center justify-center !w-36 !h-36 bg-gray-800 rounded-full border-2 border-dashed border-gray-600 hover:border-[#0EA5E9] hover:bg-gray-700 cursor-pointer transition-all duration-200 group"
                                            title="Upload profile photo"
                                        >
                                            {file ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Profile preview"
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaPlus className="text-gray-400 text-xl group-hover:text-[#0EA5E9] transition-colors" />
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mt-3">
                                    {file ? file.name : 'Click to upload photo'}
                                </p>
                            </div>

                            {/* Skills */}
                            <div className='!ml-3 !mr-3'>
                                <label className="block text-sm font-medium text-gray-300 !mb-2">
                                    Interests & Skills
                                    <span className="text-gray-500 text-xs ml-2">(max 5)</span>
                                </label>
                                <AsyncSelect<SkillOption, true, GroupBase<SkillOption>>
                                    isMulti
                                    cacheOptions
                                    defaultOptions={advancedSkills}
                                    loadOptions={handleSkillTags}
                                    value={signUpValues.interest.map((inter) => ({
                                        value: inter.trim(),
                                        label: inter.trim(),
                                    }))}
                                    onChange={(selected) => {
                                        const skills = (selected || []).map((option) => option.value.trim()).slice(0, 5);
                                        setSignUpValues({
                                            ...signUpValues,
                                            interest: skills,
                                        });
                                    }}
                                    placeholder="Search and add your interests & skills"
                                    closeMenuOnSelect={false}
                                    isClearable
                                    className={`rounded-md border ${errors.interest ? 'border-red-500' : 'border-gray-700'}`}
                                    styles={customSelectStyles}
                                    components={{ MultiValueRemove: CustomMultiValueRemove }}
                                    noOptionsMessage={() => "No matches found - try different keywords"}
                                />
                                 {errors.interest && (
                                    <p className="text-red-400 text-sm mt-2">{errors.interest}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-2">
                                    {signUpValues.interest.length}/5 selected
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-800/50 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                        {currentStep === 1 ? (
                            <>
                                <div></div>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center space-x-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium !px-6 !py-3 rounded-lg transition-all duration-200"
                                >
                                    <span>Next</span>
                                    <FaArrowRight className="text-sm" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="flex items-center space-x-2 text-gray-400 hover:text-white font-medium !px-4 !py-3 rounded-lg transition-all duration-200"
                                >
                                    <FaArrowLeft className="text-sm" />
                                    <span>Back</span>
                                </button>
                                <button
                                    onClick={onSubmit}
                                    className="flex !items-center !space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium !px-6 !py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                >
                                    <FaCheck className="text-sm" />
                                    <span>Save Profile</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
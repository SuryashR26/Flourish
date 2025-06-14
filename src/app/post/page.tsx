"use client"

import type React from "react"
import { useState, useEffect } from "react"
import FormCard from "@/components/cards/formCards"
import Navbar from "@/components/layout/navbar"
import { on } from "events"

interface PostValues {
    title: string
    content: string
    tags: string
    locationS: boolean
    locationL: string
    locked: boolean
    roleCount: number
    roleDescription: string[]
    skills: string
    authorImage: string
    authorID: string
}

interface PostValuesErrors {
    title?: string
    content?: string
    tags?: string
    locationS?: boolean
    locationL?: string
    locked?: boolean
    roleCount?: number
    roleDescription?: string[]
    skills?: string
    authorImage?: string
    authorID?: string
}

export default function PostPage() {
    const [postValues, setPostValues] = useState<PostValues>({
        title: "",
        content: "",
        tags: "",
        locationS: false,
        locationL: "",
        locked: false,
        roleCount: 1,
        roleDescription: [""],
        skills: "",
        authorImage: "",
        authorID: "",
    })

    const [errors, setErrors] = useState<PostValuesErrors>({})

    const validateForm = (): boolean => {
        const tempErrors: PostValuesErrors = {}
        let isValid = true
        if (!postValues.title.trim()) {
            tempErrors.title = "Title is required"
            isValid = false
        }
        if (!postValues.content.trim()) {
            tempErrors.content = "Content is required"
            isValid = false
        }
        if (postValues.roleDescription.some(desc => !desc.trim())) {
            tempErrors.roleDescription = postValues.roleDescription.map(desc =>
                desc.trim() ? "" : "Description is required"
            )
            isValid = false
        }
        if (!postValues.locationS && !postValues.locationL.trim()) {
            tempErrors.locationL = "Location is required for in-person posts"
            isValid = false
        }

        setErrors(tempErrors)
        return isValid
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPostValues({
            ...postValues,
            [name]: value,
        })
        if (errors[name as keyof PostValuesErrors]) {
            setErrors({
                ...errors,
                [name]: "",
            })
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            // Here you would typically send the postValues to your backend API
            console.log("Post submitted successfully", postValues);
            setPostValues({
                title: "",
                content: "",
                tags: "",
                locationS: false,
                locationL: "",
                locked: false,
                roleCount: 1,
                roleDescription: [""],
                skills: "",
                authorImage: "",
                authorID: "",
            });
            console.log("Post values reset");
            setErrors({});
        } else {
            // Form is invalid
            console.log("Form validation failed", errors);
        }

    }

    return (
        <>
            <Navbar scrollThreshold={-10} />
            <div className="min-h-screen py-10 px-4 !mt-[80px] max-w-[1400px] mx-auto">
                <div className="relative flex !justify-center">
                    <FormCard title="Post Your Idea" onSubmit={handleSubmit} style={{ width: '700px' }}>
                        <div>
                            <label>Title</label>
                            <input
                                type="text"
                                id="title"
                                value={postValues.title}
                                onChange={handleChange}
                                maxLength={100}
                                className={errors.title ? '!border-red-500' : ''}
                                name="title"
                                placeholder="Title of your Idea"
                            />
                            {errors.title && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.title}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-8">
                            <div className="w-fit">
                                <label>Location Preference</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPostValues({ ...postValues, locationS: true });
                                        // Clear location error when switching to remote
                                        setErrors({
                                            ...errors,
                                            locationL: undefined
                                        });
                                    }}
                                    className={`font-medium transition-all duration-150 !rounded-r !rounded-r-none !border-r-2 !border-black
                                  ${postValues.locationS
                                            ? '!bg-[#2a2a2a] !text-white !shadow-md'
                                            : '!bg-[#2a2a2a] !text-[#9CA3AF]'}
                                `}
                                >
                                    Remote
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPostValues({ ...postValues, locationS: false });
                                        // Validate location when switching to in-person
                                        if (!postValues.locationL.trim()) {
                                            setErrors({
                                                ...errors,
                                                locationL: "Location is required for in-person posts"
                                            });
                                        }
                                    }}
                                    className={`font-medium transition-all duration-150 !rounded-l !rounded-l-none
                                ${!postValues.locationS
                                            ? '!bg-[#2a2a2a] !text-white !border-none !shadow-md'
                                            : '!bg-[#2a2a2a] !text-[#9CA3AF] !border-none'}
                              `}
                                >
                                    In Person
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block">Location</label>
                                <input
                                    type="text"
                                    id="locationL"
                                    value={postValues.locationL}
                                    onChange={handleChange}
                                    className={errors.locationL ? '!border-red-500' : ''}
                                    name="locationL"
                                    placeholder="City, State (if applicable)"
                                />
                                {errors.locationL && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.locationL}
                                    </div>
                                )}
                                <div className="text-sm text-gray-400 mt-1 !w-full">
                                    If you selected Remote, leave this field empty.
                                </div>
                            </div>
                        </div>

                        <div>
                            <label>Your Idea</label>
                            <textarea
                                name="content"
                                value={postValues.content}
                                onChange={handleChange}
                                maxLength={450}
                                rows={8}
                                placeholder="Maximum 450 characters"
                                className={`w-full !min-h-[100px] resize-none ${errors.content ? "!border-red-500" : ""}`}
                            />
                            {errors.content && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.content}
                                </div>
                            )}
                            <div className="text-sm text-gray-400 text-right mt-1">
                                {postValues.content.length}/450 characters
                            </div>
                        </div>

                        <div className="mt-4">
                            <label> Project Tags (up to 5)</label>
                            <div className="flex flex-wrap !gap-2 !mb-2">
                                {postValues.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="!bg-[#2a2a2a] !px-8 py-3 rounded-md inline-flex items-center justify-center !text-white !min-h-[40px] !text-md relative"
                                    >
                                        {tag.trim()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTags = postValues.tags
                                                    .split(',')
                                                    .filter((_, i) => i !== index)
                                                    .join(',');
                                                setPostValues({ ...postValues, tags: newTags });
                                            }}
                                            className="absolute !-right-6 !-top-5 flex items-center justify-center !bg-transparent text-[#9CA3AF] hover:text-white transition-colors">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add tags to define your idea"
                                onKeyDown={(e) => {
                                    if (e.key === ',' || e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        const newTag = input.value.trim();

                                        if (newTag && postValues.tags.split(',').filter(tag => tag.trim()).length < 5) {
                                            const newTags = postValues.tags ?
                                                `${postValues.tags},${newTag}` : newTag;
                                            setPostValues({ ...postValues, tags: newTags });
                                            input.value = '';
                                        }
                                    }
                                }}
                                className={`${errors.tags ? "!border-red-500" : ""}`}
                            />
                            <div className="text-sm text-gray-400 mt-1">
                                {postValues.tags.split(',').filter(tag => tag.trim()).length}/5 tags
                            </div>
                        </div>

                        <div className="mt-4">
                            <label> Skill Tags (up to 5)</label>
                            <div className="flex flex-wrap !gap-2 !mb-2">
                                {postValues.skills.split(',').filter(skills => skills.trim()).map((skills, index) => (
                                    <span
                                        key={index}
                                        className="!bg-[#2a2a2a] !px-8 py-3 rounded-md inline-flex items-center justify-center !text-white !min-h-[40px] !text-md relative"
                                    >
                                        {skills.trim()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSkills = postValues.skills
                                                    .split(',')
                                                    .filter((_, i) => i !== index)
                                                    .join(',');
                                                setPostValues({ ...postValues, skills: newSkills });
                                            }}
                                            className="absolute !-right-6 !-top-5 flex items-center justify-center !bg-transparent text-[#9CA3AF] hover:text-white transition-colors">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add tags to define the skills needed for your idea"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        const newSkills = input.value.trim();

                                        if (newSkills && postValues.skills.split(',').filter(skills => skills.trim()).length < 5) {
                                            const newTags = postValues.tags ?
                                                `${postValues.tags},${newSkills}` : newSkills;
                                            setPostValues({ ...postValues, skills: newSkills });
                                            input.value = '';
                                        }
                                    }
                                }}
                                className={`${errors.tags ? "!border-red-500" : ""}`}
                            />
                            <div className="text-sm text-gray-400 mt-1">
                                {postValues.skills.split(',').filter(skills => skills.trim()).length}/5 tags
                            </div>
                        </div>

                        <div className="mt-4 flex gap-8">
                            <div className="w-1/4">
                                <label className="block mb-2">Number of Roles Needed</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={postValues.roleCount}
                                    onChange={(e) => {
                                        const count = Math.min(4, Math.max(1, parseInt(e.target.value) || 1));
                                        setPostValues({
                                            ...postValues,
                                            roleCount: count,
                                            roleDescription: Array(count).fill("").map((_, i) =>
                                                postValues.roleDescription[i] || ""
                                            )
                                        });
                                        on
                                    }}
                                    className="w-20 p-2 border rounded"
                                />
                            </div>

                            {postValues.roleCount > 0 && (
                                <div className="w-3/4">
                                    <label className="block !-mb-0">Define Your Roles</label>
                                    {postValues.roleCount === 4 ? (
                                        <div className="w-full !mt-8">
                                            <textarea
                                                value={postValues.roleDescription[0] || ""}
                                                onChange={(e) => {
                                                    setPostValues({
                                                        ...postValues,
                                                        roleDescription: [e.target.value]
                                                    });
                                                    const newErrors = [...(errors.roleDescription || [])];
                                                    newErrors[0] = e.target.value.trim() ? "" : "Description is required";
                                                    setErrors({
                                                        ...errors,
                                                        roleDescription: newErrors
                                                    });
                                                }}
                                                maxLength={400}
                                                placeholder="Define all your roles here (maximum 400 characters)"
                                                className={`w-full !min-h-[200px] resize-none p-4 border rounded text-base ${errors.roleDescription?.[0] ? "!border-red-500" : ""
                                                    }`}
                                                rows={8}
                                            />
                                            {errors.roleDescription?.[0] && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {errors.roleDescription[0]}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-400 text-right mt-1">
                                                {(postValues.roleDescription[0] || "").length}/400 characters
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col !-gap-5">
                                            {Array.from({ length: postValues.roleCount }).map((_, index) => (
                                                <div key={index} className="w-full">
                                                    <label className="text-sm text-gray-600 block mb-1">
                                                        Role {index + 1}
                                                    </label>
                                                    <textarea
                                                        value={postValues.roleDescription[index] || ""}
                                                        onChange={(e) => {
                                                            const newDescriptions = [...postValues.roleDescription];
                                                            newDescriptions[index] = e.target.value;
                                                            setPostValues({
                                                                ...postValues,
                                                                roleDescription: newDescriptions
                                                            });
                                                            const newErrors = [...(errors.roleDescription || [])];
                                                            newErrors[index] = e.target.value.trim() ? "" : "Description is required";
                                                            setErrors({
                                                                ...errors,
                                                                roleDescription: newErrors
                                                            });
                                                        }}
                                                        maxLength={200}
                                                        placeholder={`Describe role ${index + 1}`}
                                                        className={`w-full !min-h-[50px] resize-none p-4 border rounded text-base ${errors.roleDescription?.[index] ? "!border-red-500" : ""
                                                            }`}
                                                        rows={6}
                                                    />
                                                    {errors.roleDescription?.[index] && (
                                                        <div className="text-red-500 text-sm mt-1">
                                                            {errors.roleDescription[index]}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-400 text-right mt-1">
                                                        {(postValues.roleDescription[index] || "").length}/200 characters
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex gap-8">
                            <div className="w-1/2">
                                <button
                                    type="button"
                                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    Save Draft
                                </button>
                            </div>
                            <div className="w-1/2">
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    Submit Post
                                </button>
                            </div>
                        </div>
                    </FormCard>
                </div >
            </div >
        </>
    )
}


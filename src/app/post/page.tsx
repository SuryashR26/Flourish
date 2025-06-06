"use client"

import type React from "react"
import { useState, useEffect } from "react"
import FormCard from "@/components/cards/formCards"
import Navbar from "@/components/layout/navbar"


interface PostValues {
    title: string
    content: string
    tags: string
    locationS: boolean
    locationL: string
    locked: boolean
    roles: string
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
    roles?: string
    skills?: string
    authorImage?: string
    authorID?: string
}

interface PostPageProps {
    postId: string
    initialData: PostValues
    onSubmit: (data: PostValues) => void
}
export default function PostPage() {
    const [postValues, setPostValues] = useState<PostValues>({
        title: "",
        content: "",
        tags: "",
        locationS: false,
        locationL: "",
        locked: false,
        roles: "",
        skills: "",
        authorImage: "",
        authorID: "",
    })

    const [errors, setErrors] = useState<PostValuesErrors>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setPostValues({
            ...postValues,
            [name]: value,
        })
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        console.log("hello");
    }
    return (
        <>
            <Navbar scrollThreshold={-10} />
            <div className="relative h-screen flex justify-center items-center">
                <FormCard title="Post Your Idea" onSubmit={handleSubmit} style={{ width: '700px' }}>
                    <div>
                        <label> Title </label>
                        <input
                            type="text"
                            id="title"
                            value={postValues.title}
                            onChange={handleChange}
                            className={errors.title ? 'error' : ''}
                            name="title"
                            placeholder="Title of your Idea "
                        />
                    </div>
                    <div>
                        <div>
                            <label> Location Preference</label>
                            <button
                                type="button"
                                onClick={() => setPostValues({ ...postValues, locationS: true })}
                                className={`font-medium transition-all duration-150 !rounded-none !border-r-2 !border-black
                                  ${postValues.locationS
                                        ? '!bg-[#2a2a2a] !text-white !shadow-md'
                                        : '!bg-[#2a2a2a] !text-[#9CA3AF]'}
                                `}
                            >
                                Remote
                            </button>
                            <button
                                type="button"
                                onClick={() => setPostValues({ ...postValues, locationS: false })}
                                className={`font-medium transition-all duration-150 !rounded-none
                                ${!postValues.locationS
                                        ? '!bg-[#2a2a2a] !text-white !border-none !shadow-md'
                                        : '!bg-[#2a2a2a] !text-[#9CA3AF] !border-none'}
                              `}
                            >
                                In Person
                            </button>
                        </div>
                    </div>
                    <div>
                        <label>Your Idea</label>
                        <textarea
                            name="content"
                            value={postValues.content}
                            onChange={handleChange}
                            maxLength={450}
                            rows={5}
                            placeholder="Maximum 450 characters"
                            className={`${errors.content ? "!border-red-500" : ""}`}
                        />
                    </div>
                    <div className="text-sm text-gray-400 text-right mt-1">
                        {postValues.content.length}/450 characters
                    </div>
                </FormCard>
            </div>
        </>
    )
}

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import FormCard from "@/components/cards/formCards"
import Navbar from "@/components/layout/navbar"
import { createPostWithImage, cleanupFailedPost } from "@/api/apiClient"
// import { on } from "events"
import dynamic from "next/dynamic"
import { components } from "react-select"
import { X } from "lucide-react"
import type { CSSObjectWithLabel, ControlProps, MultiValueRemoveProps, OptionProps } from 'react-select';
import { useUser } from "@/context/UserContext"

interface PostValues {
    title: string
    content: string
    tags: string[]
    locationS: boolean
    locationL: string
    locked: boolean
    roleCount: number
    roleDescription: string[]
    skills: string[]
    authorImage: string
    authorID: string
    status: string
    difficulty: string
    is_draft: boolean
    time_commitment: string
    project_category: string
}

interface PostValuesErrors {
    title?: string
    content?: string
    tags?: string[]
    locationS?: boolean
    locationL?: string
    locked?: boolean
    roleCount?: number
    roleDescription?: string[]
    skills?: string[]
    authorImage?: string
    authorID?: string
    status?: string
    difficulty?: string
    is_draft?: boolean
    time_commitment?: string
    project_category?: string
}

const TAG_DIRECTORY = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
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

const TagSelect = dynamic(() => import("react-select/creatable"), { ssr: false })

const customSelectStyles = {
    control: (provided: CSSObjectWithLabel, state: ControlProps) => ({
        ...provided,
        backgroundColor: '#0B0809',
        border: state.isFocused ? '1px solid #1f98f4' : '1px solid #2f3542',
        borderRadius: 8,
        color: 'white',
        fontWeight: 400,
        minHeight: 56,
        boxShadow: 'none',
        flexWrap: 'wrap' as const,
        '&:hover': {
            border: state.isFocused ? '1px solid #1f98f4' : '1px solid #2f3542',
        },
    }),
    menu: (provided: CSSObjectWithLabel) => ({
        ...provided,
        backgroundColor: '#0B0809',
        color: 'white',
        border: '1px solid #2f3542',
        borderRadius: 8,
        zIndex: 20,
    }),
    option: (provided: CSSObjectWithLabel, state: OptionProps<unknown, boolean>) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#181c23' : '#0B0809',
        color: 'white',
        fontWeight: 400,
        cursor: 'pointer',
    }),
    input: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: 'white',
        fontWeight: 400,
    }),
    singleValue: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: 'white',
        fontWeight: 400,
    }),
    multiValue: (provided: CSSObjectWithLabel) => ({
        ...provided,
        backgroundColor: '#181c23',
        color: 'white',
        borderRadius: 8,
        minHeight: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        fontSize: 20,
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 4,
        marginBottom: 4,
    }),
    multiValueLabel: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: 'white',
        fontWeight: 400,
        fontSize: 16,
        paddingRight: 5,
        display: 'flex',
        alignItems: 'center',
    }),
    multiValueRemove: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: 'white',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        ':hover': {
            backgroundColor: '#2f3542',
            color: 'white',
        },
    }),
    placeholder: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: '#b0b8c1',
        fontWeight: 400,
    }),
};

const CustomMultiValueRemove = (props: MultiValueRemoveProps) => (
    <components.MultiValueRemove {...props}>
        <svg
            width={24} height={24} viewBox="0 0 24 24"
            style={{ display: "block" }}
            aria-hidden="true"
            focusable="false"
        >
            <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" />
            <line x1="6" y1="18" x2="18" y2="6" stroke="white" strokeWidth="2" />
        </svg>
    </components.MultiValueRemove>
);

export default function PostPage() {
    const router = useRouter()
    const [postValues, setPostValues] = useState<PostValues>({
        title: "",
        content: "",
        tags: [""],
        locationS: false,
        locationL: "",
        locked: false,
        roleCount: 1,
        roleDescription: [""],
        skills: [""],
        authorImage: "",
        authorID: "",
        status: "active",
        difficulty: "easy",
        is_draft: false,
        time_commitment: "1-2 weeks",
        project_category: "tech"
    })

    const [errors, setErrors] = useState<PostValuesErrors>({})
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [duplicateWarning, setDuplicateWarning] = useState<{ show: boolean, message: string }>({ show: false, message: "" })

    const [viewPost, setViewPost] = useState(false)

    const { user, isLoggedIn } = useUser()

    // const [scrollProgress, setScrollProgress] = useState(0)


    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login')
        }
    }, [isLoggedIn, router]);
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

        if (!postValues.project_category) {
            tempErrors.project_category = "Project Category is Required"
        }

        if (!postValues.time_commitment) {
            tempErrors.time_commitment = "Time Commitment is Required"
        }

        setErrors(tempErrors)
        return isValid
    }

    const cardRef = useRef<HTMLDivElement | null>(null);




    const validateForm2 = (): boolean => {
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
        setErrors(tempErrors)
        return isValid
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) {
            console.log("Form validation failed", errors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setIsSubmitting(true);

        try {
            const postData = {
                title: postValues.title,
                content: postValues.content,
                role_count: postValues.roleCount,
                role_description: postValues.roleDescription,
                project_tags: postValues.tags,
                skill_tags: postValues.skills,
                location_preference: postValues.locationS ? 'remote' : 'in-person',
                location: postValues.locationL,
                difficulty: postValues.difficulty,
                confirmDuplicate: duplicateWarning.show,
                status: postValues.status,
                time_commitment: postValues.time_commitment,
                project_category: postValues.project_category
            };


            const response = await createPostWithImage(
                postData,
                selectedFile?.name,
                selectedFile?.type
            );

            if (response.success) {

                if (response.uploadUrl && selectedFile) {
                    try {
                        console.log('Uploading to:', response.uploadUrl);
                        console.log('Content-Type:', selectedFile.type);
                        const uploadRes = await fetch(response.uploadUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': selectedFile.type },
                            body: selectedFile,
                        });

                        if (!uploadRes.ok) {
                            const errorText = await uploadRes.text(); // 🔍 get actual XML error
                            console.error('Upload failed:', errorText);
                            throw new Error('Upload failed');
                        }

                        console.log("Post created and image uploaded successfully!");
                        router.push('/dashboard');

                    } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);

                        await cleanupFailedPost(response.postId);
                        alert('Image upload failed. Post has been removed. Please try again.');
                        setIsSubmitting(false);
                        return;
                    }
                } else {

                    console.log("Post created successfully!");
                    router.push('/dashboard');
                }


                setPostValues({
                    title: "",
                    content: "",
                    tags: [""],
                    locationS: false,
                    locationL: "",
                    locked: false,
                    roleCount: 1,
                    roleDescription: [""],
                    skills: [""],
                    authorImage: "",
                    authorID: "",
                    status: "active",
                    difficulty: "easy",
                    is_draft: false,
                    time_commitment: "1-2 weeks",
                    project_category: ""
                });
                setSelectedFile(null);
                setErrors({});
                setDuplicateWarning({ show: false, message: "" });

            } else if (response.isDuplicate) {
                setDuplicateWarning({ show: true, message: response.message });
                setIsSubmitting(false);
            } else {
                console.error("Post creation failed:", response.message);
                alert('Failed to create post: ' + response.message);
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error("Error creating post:", error);
            alert('An error occurred while creating the post');
            setIsSubmitting(false);
        }
    }

    const handleDraftSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        if (!validateForm2()) {
            console.log("Form validation failed", errors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setIsSubmitting(true);

        try {
            const postData = {
                title: postValues.title,
                content: postValues.content,
                role_count: postValues.roleCount,
                role_description: postValues.roleDescription,
                project_tags: postValues.tags,
                skill_tags: postValues.skills,
                location_preference: postValues.locationS ? 'remote' : 'in-person',
                location: postValues.locationL,
                difficulty: postValues.difficulty,
                confirmDuplicate: duplicateWarning.show,
                status: postValues.status,
                is_draft: true,
                time_commitment: postValues.time_commitment,
                project_category: postValues.project_category
            };


            const response = await createPostWithImage(
                postData,
                selectedFile?.name,
                selectedFile?.type
            );

            if (response.success) {

                if (response.uploadUrl && selectedFile) {
                    try {
                        console.log('Uploading to:', response.uploadUrl);
                        console.log('Content-Type:', selectedFile.type);
                        const uploadRes = await fetch(response.uploadUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': selectedFile.type },
                            body: selectedFile,
                        });

                        if (!uploadRes.ok) {
                            const errorText = await uploadRes.text(); // 🔍 get actual XML error
                            console.error('Upload failed:', errorText);
                            throw new Error('Upload failed');
                        }

                        console.log("Draft created and image uploaded successfully!");
                        router.push('/dashboard');

                    } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);

                        await cleanupFailedPost(response.postId);
                        alert('Image upload failed. Post has been removed. Please try again.');
                        setIsSubmitting(false);
                        return;
                    }
                } else {

                    console.log("Draft created successfully!");
                    router.push('/dashboard');
                }


                setPostValues({
                    title: "",
                    content: "",
                    tags: [""],
                    locationS: false,
                    locationL: "",
                    locked: false,
                    roleCount: 1,
                    roleDescription: [""],
                    skills: [""],
                    authorImage: "",
                    authorID: "",
                    status: "active",
                    difficulty: "easy",
                    is_draft: false,
                    time_commitment: "1-2 weeks",
                    project_category: ""
                });
                setSelectedFile(null);
                setErrors({});
                setDuplicateWarning({ show: false, message: "" });

            } else if (response.isDuplicate) {
                setDuplicateWarning({ show: true, message: response.message });
                setIsSubmitting(false);
            } else {
                console.error("Post creation failed:", response.message);
                alert('Failed to create post: ' + response.message);
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error("Error creating post:", error);
            alert('An error occurred while creating the post');
            setIsSubmitting(false);
        }
    }



    return (
        <>
            <Navbar />
            <div
                className="scroll-progress-bar"
            // style={{ width: `${scrollProgress}%` }}
            />
            <div className="min-h-screen py-10 !mt-[80px] w-full flex justify-center items-start">
                <div className="w-full max-w-[700px] mx-auto" style={{ transform: 'translateX(-15.5px)' }}>
                    <FormCard title="Post Your Idea" onSubmit={handleSubmit} style={{ width: '100%' }} showSubmitButton={false}>
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
                                    className={`font-medium transition-all duration-150 !rounded-r !rounded-r-none !bg-[#0B0809] !border !border-[#2f3542] ${postValues.locationS ? '!text-white' : '!text-[#9CA3AF]'} !text-base !font-normal`}
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
                                    className={`font-medium transition-all duration-150 !rounded-l !rounded-l-none !bg-[#0B0809] !border !border-[#2f3542] ${!postValues.locationS ? '!text-white' : '!text-[#9CA3AF]'} !text-base !font-normal`}
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
                        <div className="flex flex-row gap-4">
                            <div className="mt-4 w-1/2">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={postValues.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-[#0B0809] text-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Completed</option>
                                </select>
                            </div>
                            <div className="mt-4 w-1/2">
                                <label>Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={postValues.difficulty}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-[#0B0809] text-white"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                        </div>
                        <div className="flex flex-row gap-4">
                            <div className="mt-4 w-1/2">
                                <label>Project Category</label>
                                <select
                                    name="project_category"
                                    value={postValues.project_category}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-[#0B0809] text-white"
                                >
                                    <option value="tech"> Tech </option>
                                    <option value="creative"> Creative</option>
                                    <option value="business"> Business</option>
                                    <option value="research"> Research</option>
                                    <option value="environment"> Environment</option>
                                </select>
                            </div>
                            <div className="mt-4 w-1/2">
                                <label>Time Commitment</label>
                                <select
                                    name="time_commitment"
                                    value={postValues.time_commitment}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded bg-[#0B0809] text-white"
                                >
                                    <option value="1-2 weeks">1-2 weeks</option>
                                    <option value="1-3 months">1-3 months</option>
                                    <option value="3-6 months">3-6 months</option>
                                    <option value="6+ months">6+ months</option>
                                </select>
                            </div>

                        </div>


                        <div className="mt-4">
                            <label> Project Tags (up to 5)</label>
                            <TagSelect
                                isMulti
                                options={postValues.tags.length >= 5 ? [] : TAG_DIRECTORY}
                                value={postValues.tags
                                    .filter((tag) => tag.trim())
                                    .map((tag) => ({ value: tag.trim(), label: tag.trim() }))}
                                onChange={(selected) => {
                                    const tags = (selected as { value: string; label: string }[])
                                        .map((option) => option.value.trim())
                                        .slice(0, 5);
                                    setPostValues({ ...postValues, tags });
                                }}
                                placeholder="Add tags to define your idea"
                                closeMenuOnSelect={false}
                                isClearable
                                styles={customSelectStyles}
                                components={{ MultiValueRemove: CustomMultiValueRemove }}
                                noOptionsMessage={() => null}
                            />

                            <div className="text-sm text-gray-400 mt-1">
                                {postValues.tags.length}/5 tags
                            </div>
                        </div>

                        <div className="mt-4">
                            <label> Skill Tags (up to 5)</label>
                            <TagSelect
                                isMulti
                                options={postValues.skills.length >= 5 ? [] : SKILL_DIRECTORY}
                                value={postValues.skills
                                    .filter((skill) => skill.trim())
                                    .map((skill) => ({ value: skill.trim(), label: skill.trim() }))}
                                onChange={(selected) => {
                                    const skills = (selected as { value: string; label: string }[])
                                        .map((option) => option.value.trim())
                                        .slice(0, 5);
                                    setPostValues({ ...postValues, skills });
                                }}
                                placeholder="Add tags to define the skills needed for your idea"
                                closeMenuOnSelect={false}
                                isClearable
                                styles={customSelectStyles}
                                components={{ MultiValueRemove: CustomMultiValueRemove }}
                                noOptionsMessage={() => null}
                            />

                            <div className="text-sm text-gray-400 mt-1">
                                {postValues.skills.length}/5 tags
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

                                    }}
                                    className="w-20 p-2 border rounded"
                                />
                            </div>

                            {postValues.roleCount > 0 && (
                                <div className="w-3/4">
                                    <label className="block !-mb-0">Define Your Roles</label>
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

                                </div>
                            )}
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <label>Project Image (Optional)</label>
                            <input
                                type="file"
                                id="imageUpload"
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png, image/jpg, image/gif, image/webp"
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {selectedFile && (
                                <div className="text-green-600 text-sm mt-1">
                                    Selected: {selectedFile.name}
                                </div>
                            )}
                        </div>

                        {/* Duplicate Warning */}
                        {duplicateWarning.show && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="text-yellow-800 text-sm mb-3">
                                    {duplicateWarning.message}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDuplicateWarning({ show: false, message: "" })}
                                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Post Anyway'}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 !w-full flex">
                            <button
                                className="w-full flex-1"
                                onClick={() => {
                                    setViewPost(true);
                                    setTimeout(() => {
                                        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 0);
                                }}
                            >
                                View Post
                            </button>
                        </div>

                        {viewPost && (
                            <div
                                ref={cardRef}
                                className="fixed !left-0 !top-0 w-full h-full flex items-center justify-center z-[999] !p-4"
                                style={{ background: "rgba(0,0,0,0.8)" }}
                                onClick={e => { if (e.target === e.currentTarget) setViewPost(false); }}
                            >
                                <div className="!bg-[#181c23] !border !border-[#333] !rounded-2xl !w-full !max-w-2xl !max-h-[90vh] !overflow-y-auto !relative !shadow-2xl">
                                    <div className="!p-8 !pb-6 !border-b !border-[#2f3542] !relative">
                                        <button
                                            onClick={() => setViewPost(false)}
                                            className="!absolute !top-5 !right-5 !text-[#888] hover:!text-white !text-2xl !p-2 !rounded-lg hover:!bg-[#2f3542] !transition-colors"
                                            aria-label="Close"
                                        >
                                            <X size={24} />
                                        </button>

                                        <h1 className="!text-3xl !font-bold !text-white !mb-4 !pr-12 !leading-tight">
                                            {postValues.title || 'Untitled Project'}
                                        </h1>

                                        <div className="flex items-center !gap-3 !mb-4">
                                            <div className="!w-10 !h-10 !rounded-full !bg-indigo-900 flex items-center justify-center !text-indigo-200 !text-sm !font-semibold">
                                                <img
                                                    src={user?.profileurl || '/images/defaultProfile.jpg'}
                                                    alt={user?.first_name || 'User'}
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null; // prevents infinite loop if fallback fails
                                                        e.currentTarget.src = '/images/defaultProfile.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="!text-white !font-medium">
                                                    {`${user?.first_name || ''} ${user?.last_name || ''}`}
                                                </div>
                                                <div className="!text-[#888] !text-sm">
                                                    {/*'Student'*/}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex !gap-2 flex-wrap">
                                            {postValues.status && (
                                                <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${postValues.status === 'active' ? '!bg-green-900 !text-green-300' :
                                                    postValues.status === 'completed' ? '!bg-blue-900 !text-blue-300' :
                                                        '!bg-yellow-900 !text-yellow-300'
                                                    }`}>
                                                    {postValues.status}
                                                </span>
                                            )}
                                            <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${postValues.locationL ? '!bg-indigo-900 !text-indigo-200' : '!bg-green-900 !text-green-300'
                                                }`}>
                                                {postValues.locationL ? 'Remote' : 'In Person'}
                                            </span>

                                        </div>
                                    </div>

                                    <div className="!p-8">
                                        {/* Project Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 !gap-6 !mb-8 !p-5 !bg-white/[0.02] !border !border-[#2f3542] !rounded-xl">
                                            <div className="flex items-center !gap-3">
                                                <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="!text-[#ccc] !text-sm">
                                                    {postValues.roleCount || 0} collaborator{postValues.roleCount !== 1 ? 's' : ''} needed
                                                </span>
                                            </div>

                                            {postValues.difficulty && (
                                                <div className="flex items-center !gap-3">
                                                    <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="!text-[#ccc] !text-sm !capitalize">
                                                        {postValues.difficulty} level
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center !gap-3">
                                                <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="!text-[#ccc] !text-sm">
                                                    {postValues.locationL ? 'Remote collaboration' : postValues.locationS}
                                                </span>
                                            </div>
                                            {postValues.time_commitment && (
                                                <div className="flex items-center !gap-3">
                                                    <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="!text-[#ccc] !text-sm">
                                                        {postValues.time_commitment}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Project Description */}
                                        <div className="!mb-8">
                                            <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                                <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                Project Description
                                            </h3>
                                            <p className="!text-[#ccc] !leading-relaxed !text-[15px] !whitespace-pre-line">
                                                {postValues.content || 'No description available'}
                                            </p>
                                        </div>
                                        <div className="!mb-8">
                                            <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                                <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                Role Description
                                            </h3>

                                            {postValues.roleDescription?.length > 0 ? (
                                                <div className="list-disc pl-5 space-y-2">
                                                    {postValues.roleDescription.map((role, index) => (
                                                        <p
                                                            key={index}
                                                            className="!text-[#ccc] !text-left !mt-3 !text-[15px]"
                                                        >
                                                            {role}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="!text-[#ccc] !leading-relaxed !text-[15px]">
                                                    No description available
                                                </p>
                                            )}
                                        </div>


                                        {/* Required Skills */}
                                        {postValues.skills && postValues.skills.length > 0 && (
                                            <div className="!mb-8">
                                                <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                                    <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                    Required Skills
                                                </h3>
                                                <div className="flex flex-wrap !gap-2">
                                                    {postValues.skills
                                                        .filter((s) => s.trim())
                                                        .map((skill, i) => (
                                                            <span
                                                                key={i}
                                                                className="!bg-[#1f2937] !text-[#1f98f4] !px-3 !py-2 !rounded-lg !text-sm !font-medium !border !border-[#1f98f4]/20"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Tags */}
                                        {postValues.tags && postValues.tags.length > 0 && (
                                            <div className="!mb-8">
                                                <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                                    <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                    Project Tags
                                                </h3>
                                                <div className="flex flex-wrap !gap-2">
                                                    {postValues.tags
                                                        .filter((t) => t.trim())
                                                        .map((tags, i) => (
                                                            <span
                                                                key={i}
                                                                className="!bg-[#1f2937] !text-[#1f98f4] !px-3 !py-2 !rounded-lg !text-sm !font-medium !border !border-[#1f98f4]/20"
                                                            >
                                                                {tags}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row !gap-3 !pt-6 !border-t !border-[#2f3542]">
                                            <button
                                                className="flex-1 !bg-[#1f98f4] !text-white !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1a7bc8] !transition-all !duration-200 hover:!-translate-y-0.5"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    return;
                                                }}
                                            >
                                                Bookmark Project
                                            </button>
                                            <button
                                                className="flex-1 !bg-transparent !text-[#1f98f4] !border !border-[#1f98f4] !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1f98f4] hover:!text-white !transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    return;
                                                }}
                                            >
                                                Contact {user?.first_name}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex gap-1">
                            <button
                                type="button"
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                onClick={(e) => {

                                    handleDraftSave(e);
                                }}
                            >
                                Save Draft
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 py-2 text-white rounded-lg transition-colors ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Post...' : 'Submit Post'}
                            </button>
                        </div>
                    </FormCard>
                </div>
            </div>
        </>
    )
}


"use client"
import { useState } from "react"
import Navbar from "@/components/layout/navbar"
import { X } from "lucide-react"
import dynamic from "next/dynamic"
import { components } from "react-select"
import { FaPlus } from "react-icons/fa"
import Link from "next/link"

const TagSelect = dynamic(() => import("react-select/creatable"), { ssr: false })
const Select = dynamic(() => import("react-select"), { ssr: false })

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

interface Project {
    id: string | number
    title: string
    description: string
    collaborators: number
    tags: string[]
    skills?: string[]
    location?: string
    remote?: boolean
    createdAt?: string
    updatedAt?: string
    author?: {
        id: string | number
        name: string
        avatar?: string
    }
    status?: "active" | "completed" | "paused"
    difficulty?: "beginner" | "intermediate" | "advanced"
}

const customSelectStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: "#0B0809",
        border: state.isFocused ? "1px solid #1f98f4" : "1px solid #2f3542",
        borderRadius: 8,
        color: "white",
        fontWeight: 400,
        minHeight: 48,
        boxShadow: "none",
        flexWrap: "wrap",
        "&:hover": {
            border: state.isFocused ? "1px solid #1f98f4" : "1px solid #2f3542",
        },
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: "#0B0809",
        color: "white",
        border: "1px solid #2f3542",
        borderRadius: 8,
        zIndex: 20,
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? "#181c23" : "#0B0809",
        color: "white",
        fontWeight: 400,
        cursor: "pointer",
    }),
    input: (provided: any) => ({
        ...provided,
        color: "white",
        fontWeight: 400,
    }),
    multiValue: (provided: any) => ({
        ...provided,
        backgroundColor: "#181c23",
        color: "white",
        borderRadius: 8,
        minHeight: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        fontSize: 18,
        paddingLeft: 8,
        paddingRight: 8,
        marginTop: 4,
        marginBottom: 4,
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: "white",
        fontWeight: 400,
        fontSize: 14,
        paddingRight: 5,
        display: "flex",
        alignItems: "center",
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        color: "white",
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        ":hover": {
            backgroundColor: "#2f3542",
            color: "white",
        },
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: "#b0b8c1",
        fontWeight: 400,
    }),
}

const CustomMultiValueRemove = (props: any) => (
    <components.MultiValueRemove {...props}>
        <svg width={20} height={20} viewBox="0 0 24 24" style={{ display: "block" }} aria-hidden="true" focusable="false">
            <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" />
            <line x1="6" y1="18" x2="18" y2="6" stroke="white" strokeWidth="2" />
        </svg>
    </components.MultiValueRemove>
)

interface PageProps {
    personalP: string
    bookmarkedP: string
    postedP: string
}

function page() {
    const [selectedProject, setSelectedProject] = useState<null | Project>(null)
    const [showAllProjects, setShowAllProjects] = useState(false)
    const [showAllProjects2, setShowAllProjects2] = useState(false)
    const projectCards: Project[] = [
        {
            id: 1,
            title: "Sample Project 1",
            collaborators: 2,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["React", "Node.js"],
            location: "San Francisco, CA",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 1,
                name: "John Doe",
                avatar: "/avatar1.jpg",
            },
        },
        {
            id: 2,
            title: "Sample Project 2",
            collaborators: 3,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["TypeScript", "Python"],
            location: "New York, NY",
            remote: false,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 2,
                name: "Jane Smith",
                avatar: "/avatar2.jpg",
            },
        },
        {
            id: 3,
            title: "Sample Project 3",
            collaborators: 1,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["Vue.js", "MongoDB"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 3,
                name: "Mike Johnson",
                avatar: "/avatar3.jpg",
            },
        },
        {
            id: 4,
            title: "Sample Project 4",
            collaborators: 4,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["Angular", "Firebase"],
            location: "Austin, TX",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 4,
                name: "Sarah Wilson",
                avatar: "/avatar4.jpg",
            },
        },
        {
            id: 5,
            title: "Sample Project 5",
            collaborators: 2,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["React Native", "GraphQL"],
            location: "Seattle, WA",
            remote: false,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 5,
                name: "Alex Brown",
                avatar: "/avatar5.jpg",
            },
        },
        {
            id: 6,
            title: "Sample Project 6",
            collaborators: 1,
            description:
                "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"],
            skills: ["Next.js", "Prisma"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 6,
                name: "Emily Davis",
                avatar: "/avatar6.jpg",
            },
        },
    ]
    return (
        <>
            <Navbar showSearchBar={true} showDashboard={true} />
            <div
                className="fixed left-0"
                style={{
                    // Push the form farther down (adjust as needed)
                    height: "100vh",
                    width: "20%",
                    minWidth: "220px",
                    zIndex: 40,
                    padding: "1rem",
                    color: "white",
                    marginLeft: "20px",
                    marginTop: "-10px",
                    borderRight: "1px solid #ccc",
                }}
            >
                <h2 className="!mb-5 !mt-30"> Total Posts Created: </h2>
                <h2 className="!mb-20"> Bookmarked Posts: </h2>
                <h1 className="text-2xl !mb-10"> Personal Preferences</h1>
                <h2> Python </h2>
                <h2> JavaScript </h2>
                <h2> React </h2>
            </div>
            <div className="flex flex-col items-rigth">
                <h1 className="text-2xl text-white" style={{ marginLeft: "30%", marginTop: "120px", marginBottom: "20px" }}>
                    Recommended Projects
                </h1>

                {/* View All Button - aligned with Projects heading */}
                <div className="flex items-center justify-between !mb-4" style={{ marginLeft: "30%", maxWidth: "1200px" }}>
                    <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="bg-[#1f98f4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7bc8] transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {showAllProjects ? "Show Less" : "View All Projects"}
                        <svg
                            className={`w-4 h-4 transition-transform ${showAllProjects ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-3 mt-4" style={{ marginLeft: "30%", maxWidth: "1200px" }}>
                    {(showAllProjects ? projectCards : projectCards.slice(0, 3)).map((project, idx) => {

                        let category = "Tech"
                        if (project.tags?.some((tag) => tag.toLowerCase().includes("creative"))) category = "Creative"
                        else if (
                            project.tags?.some(
                                (tag) => tag.toLowerCase().includes("business") || tag.toLowerCase().includes("impact"),
                            )
                        )
                            category = "Business"
                        const categoryClass =
                            category === "Tech"
                                ? "bg-blue-900/10 text-blue-400 border border-blue-400/20"
                                : category === "Creative"
                                    ? "bg-pink-600/10 text-pink-300 border border-pink-300/20"
                                    : "bg-green-900/10 text-green-400 border border-green-400/20"
                        const isRemote = project.remote
                        const locationBadgeClass = isRemote ? "bg-indigo-900 text-indigo-200" : "bg-green-900 text-green-300"
                        const locationBadgeText = isRemote ? "Remote" : "In Person"
                        const locationText = isRemote ? "Open to remote collaboration" : project.location
                        const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : ""
                        function timeAgo(date: Date) {
                            const now = new Date()
                            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                            const intervals = [
                                { label: "year", seconds: 31536000 },
                                { label: "month", seconds: 2592000 },
                                { label: "week", seconds: 604800 },
                                { label: "day", seconds: 86400 },
                                { label: "hour", seconds: 3600 },
                                { label: "minute", seconds: 60 },
                                { label: "second", seconds: 1 },
                            ]
                            for (const interval of intervals) {
                                const count = Math.floor(seconds / interval.seconds)
                                if (count >= 1) {
                                    return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
                                }
                            }
                            return "just now"
                        }
                        return (
                            <div
                                key={project.id || idx}
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col min-h-[280px] max-w-xs hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl"
                            >
                                {/* Optional: Urgent indicator (if you add a boolean or tag for urgent) */}
                                {/* {project.urgent && (
                                                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase z-10">Due Soon</div>
                                                )} */}
                                <div className="flex justify-between items-start mb-4 gap-2">
                                    <h3 className="text-lg font-semibold text-white leading-tight flex-1 line-clamp-2">
                                        {project.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${locationBadgeClass}`}>
                                        {locationBadgeText}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mb-4">{locationText}</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
                                <div className="mb-5">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(project.skills || []).slice(0, 3).map((skill, i) => (
                                            <span
                                                key={i}
                                                className={`px-3 py-1 rounded text-xs font-medium ${i < 2 ? "bg-blue-900 text-blue-200" : "bg-[#2a2a2a] text-gray-200"}`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    {project.skills && project.skills.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                            +{project.skills.length - 3} more skill{project.skills.length - 3 > 1 ? "s" : ""}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-3">
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${categoryClass}`}>
                                        {category}
                                    </span>
                                    <span className="text-xs text-gray-400">{timePosted}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Popup Modal */}
                {selectedProject && (
                    <div
                        className="fixed left-0 top-0 w-full h-full flex items-center justify-center z-[999] p-4"
                        style={{ background: "rgba(0,0,0,0.8)" }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setSelectedProject(null)
                        }}
                    >
                        <div className="bg-[#181c23] rounded-lg shadow-2xl p-6 lg:p-10 relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400 transition-colors z-10"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                            {/* Project Header */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                            {selectedProject.title || "Untitled Project"}
                                        </h2>
                                        {selectedProject.author && (
                                            <p className="text-lg text-gray-400">by {selectedProject.author.name}</p>
                                        )}
                                    </div>
                                    {selectedProject.status && (
                                        <span
                                            className={`px-3 py-1 text-sm font-medium rounded-full ml-4 ${selectedProject.status === "active"
                                                ? "bg-green-900 text-green-300"
                                                : selectedProject.status === "completed"
                                                    ? "bg-blue-900 text-blue-300"
                                                    : "bg-yellow-900 text-yellow-300"
                                                }`}
                                        >
                                            {selectedProject.status}
                                        </span>
                                    )}
                                </div>
                                {/* Project metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            {selectedProject.collaborators || 0} collaborator{selectedProject.collaborators !== 1 ? "s" : ""}{" "}
                                            needed
                                        </span>
                                    </div>
                                    {selectedProject.difficulty && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="capitalize">{selectedProject.difficulty} level</span>
                                        </div>
                                    )}
                                    {selectedProject.location && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>{selectedProject.remote ? "Remote" : selectedProject.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Project Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Project Description</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {selectedProject.description || "No description available"}
                                </p>
                            </div>
                            {/* Required Skills */}
                            {selectedProject.skills && selectedProject.skills.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="bg-[#1f2937] text-[#1f98f4] px-3 py-2 rounded-md text-sm font-medium border border-[#1f98f4]/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Project Tags */}
                            {selectedProject.tags && selectedProject.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Project Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="bg-[#0B0809] text-gray-300 px-3 py-2 rounded-md text-sm border border-[#2f3542]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-[#2f3542]">
                                <button
                                    className="flex-1 bg-[#1f98f4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7bc8] transition-colors"
                                    onClick={() => {
                                        // Handle join project action
                                        setSelectedProject(null)
                                    }}
                                >
                                    Join Project
                                </button>
                                <button
                                    className="flex-1 bg-transparent text-[#1f98f4] border border-[#1f98f4] px-6 py-3 rounded-lg font-medium hover:bg-[#1f98f4] hover:text-white transition-colors"
                                    onClick={() => {
                                        // Handle contact author action
                                        setSelectedProject(null)
                                    }}
                                >
                                    Contact Author
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-rigth">
                <h1 className="text-2xl text-white" style={{ marginLeft: "30%", marginTop: "30px", marginBottom: "20px" }}>
                    Your Projects
                </h1>

                {/* View All Button - aligned with Projects heading */}
                <div className="flex items-center justify-between !mb-4" style={{ marginLeft: "30%", maxWidth: "1200px" }}>
                    <button
                        onClick={() => setShowAllProjects2(!showAllProjects2)}
                        className="bg-[#1f98f4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7bc8] transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {showAllProjects ? "Show Less" : "View All Projects"}
                        <svg
                            className={`w-4 h-4 transition-transform ${showAllProjects2 ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-3 mt-4" style={{ marginLeft: "30%", maxWidth: "1200px", marginBottom: "20px" }}>
                    {(showAllProjects2 ? projectCards : projectCards.slice(0, 2)).map((project, idx) => {

                        let category = "Tech"
                        if (project.tags?.some((tag) => tag.toLowerCase().includes("creative"))) category = "Creative"
                        else if (
                            project.tags?.some(
                                (tag) => tag.toLowerCase().includes("business") || tag.toLowerCase().includes("impact"),
                            )
                        )
                            category = "Business"
                        const categoryClass =
                            category === "Tech"
                                ? "bg-blue-900/10 text-blue-400 border border-blue-400/20"
                                : category === "Creative"
                                    ? "bg-pink-600/10 text-pink-300 border border-pink-300/20"
                                    : "bg-green-900/10 text-green-400 border border-green-400/20"
                        const isRemote = project.remote
                        const locationBadgeClass = isRemote ? "bg-indigo-900 text-indigo-200" : "bg-green-900 text-green-300"
                        const locationBadgeText = isRemote ? "Remote" : "In Person"
                        const locationText = isRemote ? "Open to remote collaboration" : project.location
                        const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : ""
                        function timeAgo(date: Date) {
                            const now = new Date()
                            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
                            const intervals = [
                                { label: "year", seconds: 31536000 },
                                { label: "month", seconds: 2592000 },
                                { label: "week", seconds: 604800 },
                                { label: "day", seconds: 86400 },
                                { label: "hour", seconds: 3600 },
                                { label: "minute", seconds: 60 },
                                { label: "second", seconds: 1 },
                            ]
                            for (const interval of intervals) {
                                const count = Math.floor(seconds / interval.seconds)
                                if (count >= 1) {
                                    return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
                                }
                            }
                            return "just now"
                        }
                        return (
                            <div
                                key={project.id || idx}
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col min-h-[280px] max-w-xs hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl"
                            >
                                <div className="flex justify-between items-start mb-4 gap-2">
                                    <h3 className="text-lg font-semibold text-white leading-tight flex-1 line-clamp-2">
                                        {project.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${locationBadgeClass}`}>
                                        {locationBadgeText}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mb-4">{locationText}</div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
                                <div className="mb-5">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(project.skills || []).slice(0, 3).map((skill, i) => (
                                            <span
                                                key={i}
                                                className={`px-3 py-1 rounded text-xs font-medium ${i < 2 ? "bg-blue-900 text-blue-200" : "bg-[#2a2a2a] text-gray-200"}`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    {project.skills && project.skills.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                            +{project.skills.length - 3} more skill{project.skills.length - 3 > 1 ? "s" : ""}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-3">
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${categoryClass}`}>
                                        {category}
                                    </span>
                                    <span className="text-xs text-gray-400">{timePosted}</span>
                                </div>
                            </div>
                        )
                    })}
                    {!showAllProjects2 && (
                        <div className="flex items-center justify-center min-h-[280px]">
                            <Link href="/post">
                                <FaPlus className="text-6xl text-white cursor-pointer" />
                            </Link>
                        </div>
                    )}


                </div>

                {/* Popup Modal */}
                {selectedProject && (
                    <div
                        className="fixed left-0 top-0 w-full h-full flex items-center justify-center z-[999] p-4"
                        style={{ background: "rgba(0,0,0,0.8)" }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setSelectedProject(null)
                        }}
                    >
                        <div className="bg-[#181c23] rounded-lg shadow-2xl p-6 lg:p-10 relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400 transition-colors z-10"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                            {/* Project Header */}
                            <div className="mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                            {selectedProject.title || "Untitled Project"}
                                        </h2>
                                        {selectedProject.author && (
                                            <p className="text-lg text-gray-400">by {selectedProject.author.name}</p>
                                        )}
                                    </div>
                                    {selectedProject.status && (
                                        <span
                                            className={`px-3 py-1 text-sm font-medium rounded-full ml-4 ${selectedProject.status === "active"
                                                ? "bg-green-900 text-green-300"
                                                : selectedProject.status === "completed"
                                                    ? "bg-blue-900 text-blue-300"
                                                    : "bg-yellow-900 text-yellow-300"
                                                }`}
                                        >
                                            {selectedProject.status}
                                        </span>
                                    )}
                                </div>
                                {/* Project metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            {selectedProject.collaborators || 0} collaborator{selectedProject.collaborators !== 1 ? "s" : ""}{" "}
                                            needed
                                        </span>
                                    </div>
                                    {selectedProject.difficulty && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="capitalize">{selectedProject.difficulty} level</span>
                                        </div>
                                    )}
                                    {selectedProject.location && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <svg className="w-5 h-5 text-[#1f98f4]" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>{selectedProject.remote ? "Remote" : selectedProject.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Project Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Project Description</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {selectedProject.description || "No description available"}
                                </p>
                            </div>
                            {/* Required Skills */}
                            {selectedProject.skills && selectedProject.skills.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="bg-[#1f2937] text-[#1f98f4] px-3 py-2 rounded-md text-sm font-medium border border-[#1f98f4]/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Project Tags */}
                            {selectedProject.tags && selectedProject.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Project Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="bg-[#0B0809] text-gray-300 px-3 py-2 rounded-md text-sm border border-[#2f3542]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-[#2f3542]">
                                <button
                                    className="flex-1 bg-[#1f98f4] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7bc8] transition-colors"
                                    onClick={() => {
                                        // Handle join project action
                                        setSelectedProject(null)
                                    }}
                                >
                                    Join Project
                                </button>
                                <button
                                    className="flex-1 bg-transparent text-[#1f98f4] border border-[#1f98f4] px-6 py-3 rounded-lg font-medium hover:bg-[#1f98f4] hover:text-white transition-colors"
                                    onClick={() => {
                                        // Handle contact author action
                                        setSelectedProject(null)
                                    }}
                                >
                                    Contact Author
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >

        </>
    )
}

export default page

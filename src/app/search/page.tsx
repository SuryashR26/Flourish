"use client"

import React from 'react'
import Navbar from '@/components/layout/navbar'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import SplitText from 'gsap/SplitText'
import gsap from 'gsap'
import { Pagination } from '@/components/ui/pagination'
import { ChevronDownIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardAction } from "@/components/ui/card"
import { FaSearch } from 'react-icons/fa'
import { X } from 'lucide-react'
import FilterIcon from '@/components/ui/FilterIcon'
import RadiusSlider from "@/components/ui/RadiusSlider"
import dynamic from "next/dynamic"
import { components } from "react-select"

const TagSelect = dynamic(() => import("react-select/creatable"), { ssr: false })
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

const customSelectStyles = {
    control: (provided: any, state: any) => ({
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
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: '#0B0809',
        color: 'white',
        border: '1px solid #2f3542',
        borderRadius: 8,
        zIndex: 20,
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#181c23' : '#0B0809',
        color: 'white',
        fontWeight: 400,
        cursor: 'pointer',
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'white',
        fontWeight: 400,
    }),
    multiValue: (provided: any) => ({
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
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: 'white',
        fontWeight: 400,
        fontSize: 14,
        paddingRight: 5,
        display: 'flex',
        alignItems: 'center',
    }),
    multiValueRemove: (provided: any) => ({
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
    placeholder: (provided: any) => ({
        ...provided,
        color: '#b0b8c1',
        fontWeight: 400,
    }),
};

const CustomMultiValueRemove = (props: any) => (
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

gsap.registerPlugin(SplitText)

interface SearchFilter {
    LocationS: {
        remote: boolean
        inPerson: boolean
    }
    LocationL: string
    skills: string
    tags: string
}

interface Item {
    id: number
}

// Enhanced project interface for database compatibility
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
    status?: 'active' | 'completed' | 'paused'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    image?: string // Optional project image
    urgent?: boolean // For urgent projects
}

function page() {
    const [searchFilter, setSearchFilter] = useState<SearchFilter>({
        LocationS: { remote: false, inPerson: false },
        LocationL: '',
        skills: '',
        tags: ''
    })
    const [scrollProgress, setScrollProgress] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [items, setItems] = useState<Item[]>([]);
    const itemsPerPage = 10;
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(true)
    const [locationDrop, setLocationDrop] = useState(true)
    const [projectTagsDrop, setProjectTagsDrop] = useState(true)
    const [skillTagsDrop, setSkillTagsDrop] = useState(true)
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [radius, setRadius] = useState(50)

    // Popup state
    const [selectedProject, setSelectedProject] = useState<null | Project>(null);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (window.scrollY / totalHeight) * 100
            setScrollProgress(progress)
        }

        window.addEventListener("scroll", handleScroll)
        handleScroll() // Initial calculation

        // Get search query from localStorage
        const storedQuery = localStorage.getItem('searchQuery');
        if (storedQuery) {
            setSearchQuery(storedQuery);
            // Clear it after reading to avoid persistence
            localStorage.removeItem('searchQuery');
        }

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper function to get category from tags
    const getProjectCategory = (tags: string[]) => {
        const tagString = tags.join(' ').toLowerCase();
        if (tagString.includes('creative') || tagString.includes('design') || tagString.includes('art')) return 'Creative';
        if (tagString.includes('business') || tagString.includes('impact') || tagString.includes('startup')) return 'Business';
        return 'Tech';
    };

    // Helper function to get placeholder based on category
    const getCategoryPlaceholder = (category: string) => {
        switch (category) {
            case 'Creative': return '🎨 Creative Project';
            case 'Business': return '💼 Business Project';
            default: return '💻 Tech Project';
        }
    };

    // Helper function for time ago
    const timeAgo = (date: Date) => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }
        return 'just now';
    };

    // Enhanced project data with images and author info
    const projectCards: Project[] = [
        {
            id: 1,
            title: "iOS Recipe Sharing App",
            collaborators: 2,
            description: "Looking for passionate developers to build a social recipe sharing platform. Think Instagram meets cooking! We have the design ready and need...",
            tags: ["#webdevelopment", "#javascript", "#mobile"],
            skills: ["Swift", "UI/UX", "Firebase"],
            location: "Stanford, CA",
            remote: false,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 1,
                name: "Sarah Martinez",
                avatar: "/avatar1.jpg"
            },
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop",
            createdAt: "2025-06-24T10:30:00Z"
        },
        {
            id: 2,
            title: "Student Film: Digital Nomad",
            collaborators: 3,
            description: "Short film about remote work culture among Gen Z. Need cinematographer, sound engineer, and editor. Shooting starts next month...",
            tags: ["#creative", "#film", "#storytelling"],
            skills: ["Cinematography", "Video Editing", "Sound Design"],
            location: "Berkeley, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 2,
                name: "Jordan Chen"
            },
            image: "https://images.unsplash.com/photo-1489389944381-3471b5b30f04?w=400&h=200&fit=crop",
            urgent: true,
            createdAt: "2025-06-26T05:00:00Z"
        },
        {
            id: 3,
            title: "Campus Sustainability Initiative",
            collaborators: 1,
            description: "Building a comprehensive plan to reduce campus carbon footprint. Looking for environmental science students, data analysts, and marketing...",
            tags: ["#impact", "#sustainability", "#research"],
            skills: ["Data Analysis", "Research", "Marketing"],
            location: "Palo Alto, CA",
            remote: false,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 3,
                name: "Alex Rivera"
            },
            createdAt: "2025-06-25T14:20:00Z"
        },
        {
            id: 4,
            title: "AI Study Group Platform",
            collaborators: 4,
            description: "Creating an AI-powered platform that matches students for study groups based on learning styles and schedules...",
            tags: ["#webdevelopment", "#ai", "#education"],
            skills: ["Machine Learning", "React", "Node.js"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 4,
                name: "Maya Thompson"
            },
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
            createdAt: "2025-06-23T09:15:00Z"
        },
        {
            id: 5,
            title: "Campus Mental Health Podcast",
            collaborators: 2,
            description: "Weekly podcast discussing student mental health with expert interviews. Need audio editor, graphic designer, and social media manager...",
            tags: ["#creative", "#podcast", "#mentalhealth"],
            skills: ["Audio Editing", "Graphic Design", "Social Media"],
            location: "San Francisco, CA",
            remote: false,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 5,
                name: "Kai Patel"
            },
            createdAt: "2025-06-20T16:45:00Z"
        },
        {
            id: 6,
            title: "Student Marketplace App",
            collaborators: 1,
            description: "Buy/sell platform specifically for college students. Like Facebook Marketplace but with student verification and campus-specific features...",
            tags: ["#business", "#mobile", "#marketplace"],
            skills: ["React Native", "Backend", "Product Design"],
            location: "Mountain View, CA",
            remote: true,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 6,
                name: "Lisa Wang"
            },
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
            createdAt: "2025-06-19T11:30:00Z"
        },
    ];

    return (
        <div className="search-page-wrapper">
            {/* Fixed Navbar at the top */}
            <div className=" fixed top-0 left-0 w-full z-50">
                <Navbar showSearchBar={true} showSeparator={true}/>
            </div>
            {/* Fixed form sidebar */}
            <div
                className="fixed"
                style={{
                    top: "80px", // Navbar height
                    left: "20px",
                    width: "20%",
                    minWidth: "250px",
                    height: "calc(100vh - 80px)", // Full height below navbar
                    zIndex: 40,
                    borderRight: "1px solid #2f3542", // Match login page border
                    pointerEvents: "none", // Allow clicks to pass through
                }}
            >
                <div
                    className="filter-sidebar-scrollable"
                    style={{
                        height: "100%",
                        padding: "1rem",
                        paddingRight: "2rem",
                        color: "white",
                        overflowY: "auto",
                        pointerEvents: "auto", // Re-enable clicks for the content
                    }}
                >
                    {/* Filters Icon and Header */}
                    <div className="flex items-center justify-center gap-2 !mt-2 !mb-6">
                        <FilterIcon />
                        <h3 className="text-2xl font-semibold text-white">Filters</h3>
                    </div>

                    {/* Separator */}
                    <hr className="border-t border-[#2f3542] !mb-8" />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setLocationDropdownOpen((open) => !open)}
                            >
                                <label className="text-xl font-semibold text-white">Location</label>
                                <ChevronDownIcon className={`transition-transform ${locationDropdownOpen ? "rotate-180" : ""}`} />
                            </div>
                            {locationDropdownOpen && (
                                <div className="mt-4 space-y-5 pl-4">
                                    <label className="flex items-center gap-3 cursor-pointer text-base">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={searchFilter.LocationS.remote}
                                            onChange={() =>
                                                setSearchFilter((prev) => ({
                                                    ...prev,
                                                    LocationS: { remote: true, inPerson: false },
                                                }))
                                            }
                                        />
                                        Remote
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-base">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={searchFilter.LocationS.inPerson}
                                            onChange={() =>
                                                setSearchFilter((prev) => ({
                                                    ...prev,
                                                    LocationS: { remote: false, inPerson: true },
                                                }))
                                            }
                                        />
                                        In Person
                                    </label>

                                    {searchFilter.LocationS.inPerson && (
                                        <div className="mt-4">
                                            <input
                                                type="text"
                                                value={searchFilter.LocationL}
                                                onChange={(e) => {
                                                    setSearchFilter((prev) => ({
                                                        ...prev,
                                                        LocationL: e.target.value,
                                                    }));
                                                }}
                                                onSubmit={(e) => e.preventDefault()}
                                                placeholder="Enter location"
                                                className="w-full !py-2 !px-4 border border-[#2f3542] bg-[#0B0809] text-white !mt-3 font-normal text-base placeholder:text-[#b0b8c1]"
                                                style={{ borderRadius: '8px' }}
                                            />
                                            <RadiusSlider value={radius} onChange={setRadius} />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchFilter(prev => ({ ...prev, LocationL: '' }));
                                                        setRadius(50);
                                                    }}
                                                    className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-[#2f3542] rounded-lg hover:bg-[#2f3542] transition-colors"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-5 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-300 transition-colors"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <hr className="border-t border-[#2f3542]" />

                        <div>
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setProjectTagsDrop((open) => !open)}
                            >
                                <label className="text-xl font-semibold text-white">Project Tags</label>
                                <ChevronDownIcon className={`transition-transform ${projectTagsDrop ? "rotate-180" : ""}`} />
                            </div>
                            {projectTagsDrop && (
                                <div className="!mt-5">
                                    {/* Tag display above the input */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {searchFilter.tags.split(",").filter((tag) => tag.trim()).map((tag, i) => (
                                            <span key={i} className="bg-[#181c23] text-white rounded px-3 py-1 text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <Select
                                        isMulti
                                        options={TAG_DIRECTORY}
                                        value={searchFilter.tags
                                            .split(",")
                                            .filter((tag) => tag.trim())
                                            .map((tag) => ({ value: tag.trim(), label: tag.trim() }))}
                                        onChange={(selected) => {
                                            const tags = (selected as { value: string; label: string }[])
                                                .map((option) => option.value)
                                                .slice(0, 2)
                                                .join(",");
                                            setSearchFilter({ ...searchFilter, tags });
                                        }}
                                        placeholder="Add tags"
                                        closeMenuOnSelect={false}
                                        isClearable
                                        styles={customSelectStyles}
                                        components={{ MultiValueRemove: CustomMultiValueRemove }}
                                        noOptionsMessage={() => null}
                                    />
                                    <div className="text-sm text-gray-400 mt-2">
                                        {searchFilter.tags.split(",").filter((tag) => tag.trim()).length}/2 tags
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-t border-[#2f3542]" />

                        <div>
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setSkillTagsDrop((open) => !open)}
                            >
                                <label className="text-xl font-semibold text-white">Skill Tags</label>
                                <ChevronDownIcon className={`transition-transform ${skillTagsDrop ? "rotate-180" : ""}`} />
                            </div>
                            {skillTagsDrop && (
                                <div className="!mt-5">
                                    {/* Tag display above the input */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {searchFilter.skills.split(",").filter((skill) => skill.trim()).map((skill, i) => (
                                            <span 
                                                key={i} 
                                                className={`skill-tag !ml-2 !py-1 !px-2 !rounded !text-[13px] !font-medium ${
                                                    i < 2 
                                                        ? 'bg-blue-900 text-blue-200' 
                                                        : 'bg-[#2a2a2a] text-gray-200'
                                                }`}
                                            >
                                                <span className="!mx-1 !my-1">{skill}</span>
                                            </span>
                                        ))}
                                    </div>
                                    <Select
                                        isMulti
                                        options={SKILL_DIRECTORY}
                                        value={searchFilter.skills
                                            .split(",")
                                            .filter((skill) => skill.trim())
                                            .map((skill) => ({ value: skill.trim(), label: skill.trim() }))}
                                        onChange={(selected) => {
                                            const skills = (selected as { value: string; label: string }[])
                                                .map((option) => option.value)
                                                .slice(0, 2)
                                                .join(",");
                                            setSearchFilter({ ...searchFilter, skills });
                                        }}
                                        placeholder="Add skills"
                                        closeMenuOnSelect={false}
                                        isClearable
                                        styles={customSelectStyles}
                                        components={{ MultiValueRemove: CustomMultiValueRemove }}
                                        noOptionsMessage={() => null}
                                    />
                                    <div className="text-sm text-gray-400 mt-2">
                                        {searchFilter.skills.split(",").filter((skill) => skill.trim()).length}/2 skills
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add some extra space to ensure scrolling works */}
                        <div className="h-20"></div>

                        {/* Additional content to force scrolling */}
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-800 rounded">
                                <h4 className="text-white font-medium mb-2">Additional Filters</h4>
                                <p className="text-gray-400 text-sm">
                                    More filter options can be added here to ensure scrolling works properly.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded">
                                <h4 className="text-white font-medium mb-2">Filter Tips</h4>
                                <p className="text-gray-400 text-sm">
                                    Use these filters to narrow down your search results effectively.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded">
                                <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                                <p className="text-gray-400 text-sm">
                                    Save your favorite filter combinations for future use.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* Main content area with scrollable cards */}
            <div
                className="main-content-area"
                style={{
                    marginLeft: "22%",
                    paddingTop: "100px",
                    minHeight: "100vh",
                    paddingBottom: "96px",
                    paddingLeft: "4rem",
                    paddingRight: "4rem",
                }}
            >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 !mb-6">
                    <p className="text-gray-400 text-lg lg:text-xl font-medium">
                        Showing {projectCards.length} results for "{searchQuery || 'all projects'}"
                    </p>
                    <div className="relative">
                        <button
                            onClick={() => setSortDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 text-white bg-[#181c23] border border-[#2f3542] px-4 py-2 rounded-md hover:bg-[#272727] transition-colors"
                        >
                            Sort by <ChevronDownIcon size={16} />
                        </button>
                        {sortDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-[#181c23] border border-[#2f3542] rounded-md shadow-lg z-10">
                                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#272727]">Relevance</a>
                                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#272727]">Newest</a>
                                <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#272727]">Oldest</a>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="scroll-progress-bar"
                    style={{ width: `${scrollProgress}%` }}
                />
                <div style={{ minHeight: "0px" }} />
                
                {/* Enhanced Responsive grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mt-8">
                    {projectCards.map((project, idx) => {
                        const category = getProjectCategory(project.tags);
                        const categoryClass = category === 'Tech'
                            ? 'bg-blue-900/10 text-blue-400 border border-blue-400/20'
                            : category === 'Creative'
                            ? 'bg-pink-600/10 text-pink-300 border border-pink-300/20'
                            : 'bg-green-900/10 text-green-400 border border-green-400/20';
                        const isRemote = project.remote;
                        const locationBadgeClass = isRemote ? 'bg-indigo-900 text-indigo-200' : 'bg-green-900 text-green-300';
                        const locationBadgeText = isRemote ? 'Remote' : 'In Person';
                        const locationText = isRemote ? 'Open to remote collaboration' : project.location;
                        const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : 'recently';

                        return (
                            <div 
                                key={project.id || idx} 
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px] p-5"
                                onClick={() => setSelectedProject(project)}
                            >
                                {/* Urgent indicator */}
                                {project.urgent && (
                                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase z-10">
                                        Due Soon
                                    </div>
                                )}

                                {/* Project Image or Placeholder */}
                                {project.image ? (
                                    <img 
                                        src={project.image} 
                                        alt={project.title}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                        <span className="text-[#666] text-xs uppercase tracking-wider">
                                            {getCategoryPlaceholder(category)}
                                        </span>
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="p-0 pl-8 flex flex-col flex-1 relative h-full">
                                    {/* Absolutely positioned location and badge at top right of text area */}
                                    <div className="absolute mt-4 right-0 flex flex-col items-end z-10">
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] font-medium mr-4 mb-1 ${isRemote ? 'bg-[#1d4ed8] text-[#dbeafe]' : 'bg-[#2a2a2a] text-[#e5e5e5]'}`}>{locationBadgeText}</span>
                                        <span className="text-[13px] text-gray-400 !py-1 !px-2 font-medium rounded bg-transparent mr-4">{locationText}</span>
                                    </div>

                                    {/* Project Header */}
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-white leading-tight !ml-2 !mr-2 !mt-4 !mb-2 max-w-[70%]">
                                            {project.title}
                                        </h3>
                                    </div>
                                    {/* Project Category Tag under title */}
                                    <div className="w-full">
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !ml-2 !font-medium mt-1 inline-block ${category === 'Tech' ? 'bg-[#1d4ed8] text-[#dbeafe]' : category === 'Creative' ? 'bg-[#2a2a2a] text-[#e5e5e5]' : 'bg-[#2a2a2a] text-[#e5e5e5]'}`}>{category}</span>
                                    </div>

                                    {/* Description */}
                                    <div className="relative max-w-[70%] mb-4 !ml-2 !mr-2 !mt-0 !mb-2" style={{maxHeight: '3.5em', overflow: 'hidden'}}>
                                        <p className="text-gray-300 text-sm leading-snug line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-5" style={{background: 'linear-gradient(to bottom, transparent, #1a1a1a 90%)'}} />
                                    </div>

                                    {/* Skills Section */}
                                    <div className="mb-4 !mt-2 !mb-2">
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {(project.skills || []).slice(0, 3).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className={`skill-tag !ml-2 !py-1 !px-2 !rounded !text-[13px] !font-medium ${
                                                        i < 2
                                                            ? 'bg-[#1d4ed8] text-[#dbeafe]'
                                                            : 'bg-[#2a2a2a] text-[#e5e5e5]'
                                                    }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        {project.skills && project.skills.length > 3 && (
                                            <div className="text-xs text-gray-500 !ml-2 !mr-2 !mt-2 !mb-2">
                                                +{project.skills.length - 3} more skill{project.skills.length - 3 > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                    {/* Footer: author bottom left, date bottom right */}
                                    <div className="absolute left-4 bottom-4 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-200 text-xs font-semibold flex-shrink-0">
                                            {getInitials(project.author?.name || 'Unknown')}
                                        </div>
                                        <span className="text-[#888] text-sm font-medium">
                                            {project.author?.name || 'Unknown Author'}
                                        </span>
                                    </div>
                                    <div className="absolute right-8 bottom-4">
                                        <span className="!text-[13px] text-gray-400">
                                            {timePosted}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className=" bottom-0 !mb-3 left-0 w-full z-50 flex justify-center py-4 text-white">
                <Pagination
                    pageCount={10}
                    currentPage={currentPage}
                    onPageChange={(page: number) => setCurrentPage(page)}
                    className="bg-black-100 text-white"
                />
            </div>
        </div>
    )
}

export default page
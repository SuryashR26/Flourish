"use client"

import React, { useRef, useLayoutEffect, useState, useCallback } from 'react'
import Navbar from '@/components/layout/navbar'
import { useEffect } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { ChevronDownIcon } from "lucide-react"
import { X } from 'lucide-react'
import FilterIcon from '@/components/ui/FilterIcon'
import dynamic from "next/dynamic"
import { components } from "react-select"

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

interface SearchFilter {
    LocationS: {
        remote: boolean
        inPerson: boolean
    }
    LocationL: string
    skills: string
    tags: string
}

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
        title?: string // Added for popup display
    }
    status?: 'active' | 'completed' | 'paused'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    image?: string // Optional project image
    urgent?: boolean // For urgent projects
    timeCommitment?: string // Added for popup
    fullDescription?: string // Extended description for popup
}

// SkillsRow component: only show as many skills as fit in 70% of the card width, then "+ x more skills"
function SkillsRow({ skills = [] }: { skills: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(skills.length);

    const calculateVisibleCount = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const parent = container.parentElement;
        if (!parent) return;
        const maxWidth = parent.offsetWidth * 0.8;
        const tagWidths: number[] = [];
        Array.from(container.children).forEach((child) => {
            if (child instanceof HTMLElement) {
                tagWidths.push(child.offsetWidth);
            }
        });
        let total = 0;
        let count = skills.length;
        // Always include the '+ x more skills' tag if not all fit
        if (skills.length > 0) {
            // Create a hidden moreTag to measure its width
            const moreTag = document.createElement('span');
            moreTag.className = '!mt-[6px] !text-[14px] !text-gray-400';
            moreTag.style.visibility = 'hidden';
            moreTag.innerText = `+${skills.length - 1} more skills`;
            container.appendChild(moreTag);
            const moreWidth = moreTag.offsetWidth;
            container.removeChild(moreTag);
            // Try to fit as many as possible, always including the moreTag if not all fit
            total = 0;
            count = 0;
            for (let i = 0; i < tagWidths.length; i++) {
                // If not all fit, reserve space for the moreTag
                if (total + tagWidths[i] + (i < skills.length - 1 ? moreWidth : 0) > maxWidth) break;
                total += tagWidths[i];
                count++;
            }
            // If nothing fits, show only '+N more skills'
            if (count === 0 && skills.length > 0) {
                count = 0;
            }
        }
        setVisibleCount(count);
    };

    useLayoutEffect(() => {
        calculateVisibleCount();
    }, [skills]);

        useLayoutEffect(() => {
            const handleResize = () => {
                setTimeout(calculateVisibleCount, 100);
            };
            window.addEventListener('resize', handleResize);
            let resizeObserver: ResizeObserver | null = null;
            if (containerRef.current && window.ResizeObserver) {
                resizeObserver = new ResizeObserver(() => {
                setTimeout(calculateVisibleCount, 100);
            });
            resizeObserver.observe(containerRef.current);
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [skills.length]);

    return (
        <div ref={containerRef} className="flex flex-wrap !gap-2">
            {visibleCount > 0 && skills.slice(0, visibleCount).map((skill, i) => (
                <span
                    key={i}
                    className={`skill-tag !py-1 !px-2 !rounded !text-[13px] !font-medium ${
                        i < 2
                            ? 'bg-[#1d4ed8] text-[#dbeafe]'
                            : 'bg-[#2a2a2a] text-[#e5e5e5]'
                    }`}
                >
                    {skill}
                </span>
            ))}
            {visibleCount > 0 && visibleCount < skills.length && (
                <span className="!mt-[6px] !text-[14px] !text-gray-400">
                    +{skills.length - visibleCount} more skills
                </span>
            )}
            {visibleCount === 0 && skills.length > 0 && (
                <span className="!mt-[6px] !text-[14px] !text-gray-400">
                    +{skills.length} more skills
                </span>
            )}
        </div>
    );
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
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(true)
    const [projectTagsDrop, setProjectTagsDrop] = useState(true)
    const [skillTagsDrop, setSkillTagsDrop] = useState(true)
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [radius, setRadius] = useState(50)
    // Popup state
    const [selectedProject, setSelectedProject] = useState<null | Project>(null);
    // Add state for accordion sections at the top of the component:
    const [categoryOpen, setCategoryOpen] = useState(true);
    const [difficultyOpen, setDifficultyOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);

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
            fullDescription: "Looking for passionate developers to build a social recipe sharing platform that combines the visual appeal of Instagram with the functionality of cooking apps. We have completed the initial design phase and user research, and now need experienced developers to bring this vision to life.\n\nThe app will feature recipe sharing, social interactions, meal planning, and grocery list generation. We're particularly interested in incorporating AR features for portion visualization and cooking guidance. This is a great opportunity to work on a consumer-facing product that could make a real impact on how people cook and share food experiences.",
            tags: ["#mobile-development", "#social-app", "#food-tech", "#consumer-product"],
            skills: ["Swift", "UI/UX Design", "Firebase", "Core Data", "ARKit"],
            location: "Stanford, CA",
            remote: false,
            status: "active",
            difficulty: "intermediate",
            timeCommitment: "3-4 months commitment",
            author: {
                id: 1,
                name: "Sarah Martinez",
                avatar: "/avatar1.jpg",
                title: "Computer Science • Stanford '25"
            },
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop",
            createdAt: "2025-06-24T10:30:00Z"
        },
        {
            id: 2,
            title: "Student Film: Digital Nomad",
            collaborators: 3,
            description: "Short film about remote work culture among Gen Z. Need cinematographer, sound engineer, and editor. Shooting starts next month...",
            fullDescription: "Short film about remote work culture among Gen Z students and professionals. We're exploring themes of flexibility, isolation, community, and the future of work through personal stories and interviews. Need cinematographer, sound engineer, and editor for a 15-minute documentary-style film. Shooting starts next month with interviews scheduled around campus.",
            tags: ["#creative", "#film", "#storytelling", "#documentary"],
            skills: ["Cinematography", "Video Editing", "Sound Design", "Adobe Premiere"],
            location: "Berkeley, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            timeCommitment: "6-8 weeks",
            author: {
                id: 2,
                name: "Jordan Chen",
                title: "Film Studies • UC Berkeley '26"
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
            fullDescription: "Building a comprehensive plan to reduce campus carbon footprint by 40% over the next 5 years. This project involves data collection, policy research, stakeholder interviews, and creating actionable recommendations for university administration. Looking for environmental science students, data analysts, and marketing specialists to help with research, analysis, and community outreach.",
            tags: ["#impact", "#sustainability", "#research", "#policy"],
            skills: ["Data Analysis", "Research", "Marketing", "Environmental Science", "Policy Writing"],
            location: "Palo Alto, CA",
            remote: false,
            status: "active",
            difficulty: "advanced",
            timeCommitment: "Full semester",
            author: {
                id: 3,
                name: "Alex Rivera",
                title: "Environmental Engineering • Stanford '24"
            },
            createdAt: "2025-06-25T14:20:00Z"
        },
        {
            id: 4,
            title: "AI Study Group Platform",
            collaborators: 4,
            description: "Creating an AI-powered platform that matches students for study groups based on learning styles and schedules...",
            fullDescription: "Creating an AI-powered platform that matches students for study groups based on learning styles, schedules, and academic goals. The platform will use machine learning to optimize group formation and track study session effectiveness. This is a full-stack project with potential for real campus deployment.",
            tags: ["#webdevelopment", "#ai", "#education", "#machine-learning"],
            skills: ["Machine Learning", "React", "Node.js", "Python", "TensorFlow"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            timeCommitment: "3-5 months",
            author: {
                id: 4,
                name: "Maya Thompson",
                title: "Computer Science • MIT '25"
            },
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
            createdAt: "2025-06-23T09:15:00Z"
        },
        {
            id: 5,
            title: "Campus Mental Health Podcast",
            collaborators: 2,
            description: "Weekly podcast discussing student mental health with expert interviews. Need audio editor, graphic designer, and social media manager...",
            fullDescription: "Weekly podcast discussing student mental health challenges, resources, and success stories. Each episode features expert interviews, student stories, and practical advice. Need audio editor, graphic designer for episode artwork, and social media manager to build our community and reach students who need support.",
            tags: ["#creative", "#podcast", "#mentalhealth", "#community"],
            skills: ["Audio Editing", "Graphic Design", "Social Media", "Content Creation"],
            location: "San Francisco, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            timeCommitment: "Ongoing weekly",
            author: {
                id: 5,
                name: "Kai Patel",
                title: "Psychology • UCSF '25"
            },
            createdAt: "2025-06-20T16:45:00Z"
        },
        {
            id: 6,
            title: "Student Marketplace App",
            collaborators: 1,
            description: "Buy/sell platform specifically for college students. Like Facebook Marketplace but with student verification and campus-specific features...",
            fullDescription: "Buy/sell platform specifically for college students. Like Facebook Marketplace but with student verification, campus-specific categories, and features like textbook trading, dorm furniture exchange, and ride sharing. Includes safety features, rating systems, and integration with university authentication.",
            tags: ["#business", "#mobile", "#marketplace", "#fintech"],
            skills: ["React Native", "Backend Development", "Product Design", "Payment Integration"],
            location: "Mountain View, CA",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            timeCommitment: "4-6 months",
            author: {
                id: 6,
                name: "Lisa Wang",
                title: "Business & Computer Science • Stanford '24"
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
            <div className="filters-sidebar !w-[300px] !bg-black !border-r !border-[#2f3542] !p-5 h-screen fixed top-[80px] left-0 z-40 flex flex-col">
                <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Filters Header */}
                    <div className="filters-header flex items-center !gap-2 !mb-6 !pb-4 !border-b !border-[#2f3542]">
                        <FilterIcon className="!w-5 !h-5 !text-[#1f98f4]" />
                        <h2 className="filters-title !text-[20px] !font-semibold !text-white">Filters</h2>
                    </div>

                    {/* Location Filter */}
                    <div className="filter-section !mb-6">
                        <div className="filter-header flex items-center justify-between cursor-pointer !mb-3 !py-2" onClick={() => setLocationDropdownOpen(open => !open)}>
                            <span className="filter-label !text-[16px] !font-medium !text-white">Location</span>
                            <ChevronDownIcon className={`chevron !w-4 !h-4 !text-[#888] transition-transform ${locationDropdownOpen ? 'open !rotate-180' : ''}`} />
                        </div>
                        <div className={`filter-content !pl-2 ${locationDropdownOpen ? '' : 'hidden'}`}> 
                            <div className="location-options flex flex-col !gap-3 !mb-4">
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" checked={searchFilter.LocationS.remote} onChange={() => setSearchFilter(prev => ({ ...prev, LocationS: { remote: true, inPerson: false } }))} />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Remote</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" checked={searchFilter.LocationS.inPerson} onChange={() => setSearchFilter(prev => ({ ...prev, LocationS: { remote: false, inPerson: true } }))} />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">In Person</span>
                                </label>
                            </div>
                            <input type="text" className="location-input !w-full !py-2.5 !px-3 !bg-[#0B0809] !border !border-[#2f3542] !rounded-lg !text-white !text-[14px] !mb-3 placeholder:!text-[#666]" placeholder="Enter location (e.g., Stanford, CA)" value={searchFilter.LocationL} onChange={e => setSearchFilter(prev => ({ ...prev, LocationL: e.target.value }))} />
                            {/* Radius Slider directly under location input */}
                            <div className="radius-container !my-4">
                                <label className="radius-label !text-[12px] !text-[#888] !mb-2 block">Search radius</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={100}
                                    value={radius}
                                    onChange={e => setRadius(Number(e.target.value))}
                                    className="!w-full !h-1 !bg-[#2f3542] !rounded !mb-2 focus:!outline-none focus:!border-[#1f98f4] accent-[#1f98f4]"
                                />
                                <div className="radius-value !text-[12px] !text-[#1f98f4] text-center">{radius} miles</div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Filter */}
                    <div className="filter-section !mb-6">
                        <div className="filter-header flex items-center justify-between cursor-pointer !mb-3 !py-2" onClick={() => setSkillTagsDrop(open => !open)}>
                            <span className="filter-label !text-[16px] !font-medium !text-white">Required Skills</span>
                            <ChevronDownIcon className={`chevron !w-4 !h-4 !text-[#888] transition-transform ${skillTagsDrop ? 'open !rotate-180' : ''}`} />
                        </div>
                        <div className={`filter-content !pl-2 ${skillTagsDrop ? '' : 'hidden'}`}> 
                            <div className="tags-container relative">
                                <Select
                                    isMulti
                                    options={SKILL_DIRECTORY}
                                    value={searchFilter.skills.split(",").filter(skill => skill.trim()).map(skill => ({ value: skill.trim(), label: skill.trim() }))}
                                    onChange={selected => {
                                        const skills = (selected as { value: string; label: string }[]).map(option => option.value).slice(0, 5).join(",");
                                        setSearchFilter({ ...searchFilter, skills });
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
                                    {searchFilter.skills.split(",").filter(skill => skill.trim()).map((skill, i) => (
                                        <span key={i} className="tag-chip !bg-[#181c23] !text-white !px-2 !py-1 !rounded !text-[12px] flex items-center !gap-1">
                                            {skill}
                                            <span className="tag-remove !text-[#888] !text-[14px] cursor-pointer hover:!text-white" onClick={() => {
                                                const skillsArr = searchFilter.skills.split(",").filter(s => s.trim());
                                                skillsArr.splice(i, 1);
                                                setSearchFilter({ ...searchFilter, skills: skillsArr.join(",") });
                                            }}>×</span>
                                        </span>
                                    ))}
                                </div>
                                <div className="tag-limit !text-[11px] !text-[#666] !mt-1">{searchFilter.skills.split(",").filter(skill => skill.trim()).length}/5 skills selected</div>
                            </div>
                        </div>
                    </div>

                    {/* Project Category Filter */}
                    <div className="filter-section !mb-6">
                        <div className="filter-header flex items-center justify-between cursor-pointer !mb-3 !py-2" onClick={() => setCategoryOpen(open => !open)}>
                            <span className="filter-label !text-[16px] !font-medium !text-white">Project Category</span>
                            <ChevronDownIcon className={`chevron !w-4 !h-4 !text-[#888] transition-transform ${categoryOpen ? 'open !rotate-180' : ''}`} />
                        </div>
                        <div className={`filter-content !pl-2 ${categoryOpen ? '' : 'hidden'}`}> 
                            <div className="difficulty-options flex flex-col !gap-2">
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Tech</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Creative</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Business</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Environment</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Level Filter */}
                    <div className="filter-section !mb-6">
                        <div className="filter-header flex items-center justify-between cursor-pointer !mb-3 !py-2" onClick={() => setDifficultyOpen(open => !open)}>
                            <span className="filter-label !text-[16px] !font-medium !text-white">Difficulty Level</span>
                            <ChevronDownIcon className={`chevron !w-4 !h-4 !text-[#888] transition-transform ${difficultyOpen ? 'open !rotate-180' : ''}`} />
                        </div>
                        <div className={`filter-content !pl-2 ${difficultyOpen ? '' : 'hidden'}`}> 
                            <div className="difficulty-options flex flex-col !gap-2">
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Beginner Friendly</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Intermediate</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">Advanced</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Time Commitment Filter */}
                    <div className="filter-section !mb-6">
                        <div className="filter-header flex items-center justify-between cursor-pointer !mb-3 !py-2" onClick={() => setTimeOpen(open => !open)}>
                            <span className="filter-label !text-[16px] !font-medium !text-white">Time Commitment</span>
                            <ChevronDownIcon className={`chevron !w-4 !h-4 !text-[#888] transition-transform ${timeOpen ? 'open !rotate-180' : ''}`} />
                        </div>
                        <div className={`filter-content !pl-2 ${timeOpen ? '' : 'hidden'}`}> 
                            <div className="time-options flex flex-col !gap-2">
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">1-2 weeks</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">1-3 months</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">3-6 months</span>
                                </label>
                                <label className="checkbox-option flex items-center !gap-2 cursor-pointer !py-1">
                                    <input type="checkbox" className="custom-checkbox !w-[18px] !h-[18px] !border-2 !border-[#2f3542] !rounded !bg-transparent" />
                                    <span className="option-label !text-[14px] !text-[#ccc] select-none">6+ months</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="filter-actions flex !gap-2 !pt-4 !border-t !border-[#2f3542] w-full bg-black">
                    <button className="btn btn-clear flex-1 !bg-transparent !text-[#888] !border !border-[#2f3542] !px-4 !py-2 !rounded-lg !text-[14px] !font-medium hover:!bg-[#2f3542] hover:!text-white">Clear All</button>
                    <button className="btn btn-apply flex-1 !bg-[#1f98f4] !text-white !px-4 !py-2 !rounded-lg !text-[14px] !font-medium hover:!bg-[#1a7bc8]">Apply</button>
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
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
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
                                <div className="!p-5 flex flex-col flex-1">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start !gap-3 !mb-3">
                                        <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                            {project.title}
                                        </h3>
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0 ${category === 'Tech' ? 'bg-[#1d4ed8] text-[#dbeafe]' : category === 'Creative' ? 'bg-[#2a2a2a] text-[#e5e5e5]' : 'bg-[#2a2a2a] text-[#e5e5e5]'}`}>{category}</span>
                                    </div>
                                    {/* In Person/Remote tag and location */}
                                    <div className="flex items-center !gap-2 !mb-3">
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? 'bg-[#1d4ed8] text-[#dbeafe]' : 'bg-[#2a2a2a] text-[#e5e5e5]'}`}>{locationBadgeText}</span>
                                        {!isRemote && (
                                            <span className="!text-[13px] !text-gray-400">
                                                {project.location}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Description */}
                                    <div className="!mb-4 flex-1">
                                        <p className="!text-gray-300 !text-sm leading-snug line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Skills Section */}
                                    <div className="!mb-4">
                                        <SkillsRow skills={project.skills || []} />
                                    </div>
                                    
                                    {/* Footer */}
                                    <div className="flex justify-between items-center !gap-3 !mt-auto">
                                        <div className="flex items-center !gap-2">
                                            <div className="w-7 h-7 !rounded-full bg-indigo-900 flex items-center justify-center !text-indigo-200 !text-xs !font-semibold flex-shrink-0">
                                                {getInitials(project.author?.name || 'Unknown')}
                                            </div>
                                            <span className="!text-[#888] !text-sm !font-medium">
                                                {project.author?.name || 'Unknown Author'}
                                            </span>
                                        </div>
                                        <span className="!text-[13px] !text-gray-400">
                                            {timePosted}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                
                {selectedProject && (
                    <div
                        className="fixed left-0 top-0 w-full h-full flex items-center justify-center z-[999] !p-4"
                        style={{ background: "rgba(0,0,0,0.8)" }}
                        onClick={e => { if (e.target === e.currentTarget) setSelectedProject(null); }}
                    >
                        <div className="!bg-[#181c23] !border !border-[#333] !rounded-2xl !w-full !max-w-2xl !max-h-[90vh] !overflow-y-auto !relative !shadow-2xl">
                            <div className="!p-8 !pb-6 !border-b !border-[#2f3542] !relative">
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="!absolute !top-5 !right-5 !text-[#888] hover:!text-white !text-2xl !p-2 !rounded-lg hover:!bg-[#2f3542] !transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={24} />
                                </button>
                                
                                <h1 className="!text-3xl !font-bold !text-white !mb-4 !pr-12 !leading-tight">
                                    {selectedProject.title || 'Untitled Project'}
                                </h1>
                                
                                <div className="flex items-center !gap-3 !mb-4">
                                    <div className="!w-10 !h-10 !rounded-full !bg-indigo-900 flex items-center justify-center !text-indigo-200 !text-sm !font-semibold">
                                        {getInitials(selectedProject.author?.name || 'Unknown')}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="!text-white !font-medium">
                                            {selectedProject.author?.name || 'Unknown Author'}
                                        </div>
                                        <div className="!text-[#888] !text-sm">
                                            {selectedProject.author?.title || 'Student'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex !gap-2 flex-wrap">
                                    {selectedProject.status && (
                                        <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${
                                            selectedProject.status === 'active' ? '!bg-green-900 !text-green-300' :
                                            selectedProject.status === 'completed' ? '!bg-blue-900 !text-blue-300' :
                                            '!bg-yellow-900 !text-yellow-300'
                                        }`}>
                                            {selectedProject.status}
                                        </span>
                                    )}
                                    <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${
                                        selectedProject.remote ? '!bg-indigo-900 !text-indigo-200' : '!bg-green-900 !text-green-300'
                                    }`}>
                                        {selectedProject.remote ? 'Remote' : 'In Person'}
                                    </span>
                                    {selectedProject.urgent && (
                                        <span className="!px-3 !py-1 !text-sm !font-medium !rounded-full !bg-red-600 !text-white">
                                            Urgent
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="!p-8">
                                {/* Project Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 !gap-6 !mb-8 !p-5 !bg-white/[0.02] !border !border-[#2f3542] !rounded-xl">
                                    <div className="flex items-center !gap-3">
                                        <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span className="!text-[#ccc] !text-sm">
                                            {selectedProject.collaborators || 0} collaborator{selectedProject.collaborators !== 1 ? 's' : ''} needed
                                        </span>
                                    </div>
                                    
                                    {selectedProject.difficulty && (
                                        <div className="flex items-center !gap-3">
                                            <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                            </svg>
                                            <span className="!text-[#ccc] !text-sm !capitalize">
                                                {selectedProject.difficulty} level
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center !gap-3">
                                        <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="!text-[#ccc] !text-sm">
                                            {selectedProject.remote ? 'Remote collaboration' : selectedProject.location}
                                        </span>
                                    </div>
                                    
                                    {selectedProject.timeCommitment && (
                                        <div className="flex items-center !gap-3">
                                            <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                            </svg>
                                            <span className="!text-[#ccc] !text-sm">
                                                {selectedProject.timeCommitment}
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
                                        {selectedProject.fullDescription || selectedProject.description || 'No description available'}
                                    </p>
                                </div>
                                
                                {/* Required Skills */}
                                {selectedProject.skills && selectedProject.skills.length > 0 && (
                                    <div className="!mb-8">
                                        <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                            <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                            Required Skills
                                        </h3>
                                        <div className="flex flex-wrap !gap-2">
                                            {selectedProject.skills.map((skill, i) => (
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
                                {selectedProject.tags && selectedProject.tags.length > 0 && (
                                    <div className="!mb-8">
                                        <h3 className="!text-lg !font-semibold !text-white !mb-3 flex items-center !gap-2">
                                            <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                            Project Tags
                                        </h3>
                                        <div className="flex flex-wrap !gap-2">
                                            {selectedProject.tags.map((tag, i) => (
                                                <span 
                                                    key={i} 
                                                    className="!bg-[#0B0809] !text-gray-300 !px-3 !py-2 !rounded-lg !text-sm !border !border-[#2f3542]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row !gap-3 !pt-6 !border-t !border-[#2f3542]">
                                    <button
                                        className="flex-1 !bg-[#1f98f4] !text-white !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1a7bc8] !transition-all !duration-200 hover:!-translate-y-0.5"
                                        onClick={() => {
                                            // Handle join project action
                                            console.log('Joining project:', selectedProject.title);
                                            setSelectedProject(null);
                                        }}
                                    >
                                        Join Project
                                    </button>
                                    <button
                                        className="flex-1 !bg-transparent !text-[#1f98f4] !border !border-[#1f98f4] !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1f98f4] hover:!text-white !transition-colors"
                                        onClick={() => {
                                            // Handle contact author action
                                            console.log('Contacting author:', selectedProject.author?.name);
                                            setSelectedProject(null);
                                        }}
                                    >
                                        Contact {selectedProject.author?.name?.split(' ')[0] || 'Author'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
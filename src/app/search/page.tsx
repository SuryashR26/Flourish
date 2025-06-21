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
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
    const [locationDrop, setLocationDrop] = useState(false)
    const [projectTagsDrop, setProjectTagsDrop] = useState(false)
    const [skillTagsDrop, setSkillTagsDrop] = useState(false)

    // Popup state
    const [selectedProject, setSelectedProject] = useState<null | {
        title: string,
        collaborators: number,
        description: string,
        tags: string[]
    }>(null);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (window.scrollY / totalHeight) * 100
            setScrollProgress(progress)
        }

        window.addEventListener("scroll", handleScroll)
        handleScroll() // Initial calculation

        // GSAP Animation
        document.fonts.ready.then(() => {
            gsap.set('.flourish-title', { opacity: 1 });
            // Animate heading first
            const heading = document.querySelector('h1.flourish-title');
            const button = document.querySelector('.btns.flourish-title');
            let headingSplit, buttonSplit;
            if (heading) {
                SplitText.create(heading, {
                    type: 'words,lines',
                    linesClass: 'line',
                    autoSplit: true,
                    mask: 'lines',
                    onSplit: (self) => {
                        headingSplit = gsap.from(self.lines, {
                            duration: 1.1,
                            yPercent: 100,
                            opacity: 0,
                            stagger: 0.09,
                            ease: 'expo.out',
                        });
                        return headingSplit;
                    },
                });
            }
            if (button) {
                SplitText.create(button, {
                    type: 'words,lines',
                    linesClass: 'line',
                    autoSplit: true,
                    mask: 'lines',
                    onSplit: (self) => {
                        buttonSplit = gsap.from(self.lines, {
                            duration: 0.7,
                            yPercent: 100,
                            opacity: 0,
                            stagger: 0.08,
                            delay: 0.5, // Staggered after heading
                            ease: 'expo.out',
                            onComplete: () => {
                                // Add the animate-border class after text animation completes
                                button.classList.add('animate-border');
                            }
                        });
                        return buttonSplit;
                    },
                });
            }
        });

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Helper for popup: project data
    const projectCards = [
        {
            title: "Sample Project 1",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
        {
            title: "Sample Project 2",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
        {
            title: "Sample Project 3",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
        {
            title: "Sample Project 4",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
        {
            title: "Sample Project 5",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
        {
            title: "Sample Project 6",
            collaborators: 2,
            description: "This is a sample project description that provides an overview of the project goals and requirements.",
            tags: ["#webdevelopment", "#javascript"]
        },
    ];

    return (
        <>
            {/* Fixed Navbar at the top */}
            <div className=" fixed top-0 left-0 w-full z-50">
                <Navbar />
            </div>
            <div className="relative flex flex-col items-center justify-center !mt-15">
                <input
                    type="text"
                    placeholder="Search for projects..."
                    className="w-[500px] h-[50px] p-2 mt-2 rounded-md border border-gray-300 bg-[#181c23] text-white pl-12"
                    style={{ marginTop: "60px" }}
                />
                <FaSearch
                    className="absolute left-4 top-[74px] left-[940px] !bg-[#181c23] !text-white pointer-events-none"
                    style={{ fontSize: "1.5rem" }}
                />
            </div>
            {/* Fixed form sidebar */}
            <div
                className="fixed left-0"
                style={{
                    top: "120px",
                    height: "calc(100vh - 120px)",
                    width: "20%",
                    minWidth: "220px",
                    zIndex: 40,
                    padding: "1rem",
                    color: "white",
                    marginLeft: "20px",
                    marginTop: "80px",
                }}
            >
                < div
                    className="fixed left-0"
                    style={{
                        top: "120px", // Push the form farther down (adjust as needed)
                        height: "calc(100vh - 120px)",
                        width: "20%",
                        minWidth: "220px",
                        zIndex: 40,
                        padding: "1rem",
                        color: "white",
                        marginLeft: "20px",
                        marginTop: "80px",
                    }}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                        className="h-full flex flex-col"
                    >
                        <div className="mb-4">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setLocationDropdownOpen((open) => !open)}
                            >
                                <label className="text-white font-medium">Location Preference</label>
                                <ChevronDownIcon className={`transition-transform ${locationDropdownOpen ? "rotate-180" : ""}`} />
                            </div>
                            {locationDropdownOpen && (
                                <div className="mt-2 bg-black-100 text-white rounded shadow p-2 z-50 absolute left-0 w-full">
                                    <label className="flex items-center gap-5 cursor-pointer !mt-5 !ml-10">
                                        <input
                                            type="checkbox"
                                            checked={searchFilter.LocationS.remote}
                                            onChange={() =>
                                                setSearchFilter((prev) => ({
                                                    ...prev,
                                                    LocationS: {
                                                        ...prev.LocationS,
                                                        remote: !prev.LocationS.remote,
                                                    },
                                                }))
                                            }
                                        />
                                        Remote
                                    </label>
                                    <label className="flex items-center gap-5 cursor-pointer !ml-10">
                                        <input
                                            type="checkbox"
                                            checked={searchFilter.LocationS.inPerson}
                                            onChange={() =>
                                                setSearchFilter((prev) => ({
                                                    ...prev,
                                                    LocationS: {
                                                        ...prev.LocationS,
                                                        inPerson: !prev.LocationS.inPerson,
                                                    },
                                                }))
                                            }
                                        />
                                        In Person
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="!mt-20">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setLocationDrop((open) => !open)}
                            >
                                <label className="text-white font-medium">Set Location</label>
                                <ChevronDownIcon className={`transition-transform ${locationDrop ? "rotate-180" : ""}`} />
                            </div>
                            {locationDrop && (
                                <div className="!mt-5 bg-black-100 text-white rounded shadow p-2 z-50 !ml-3 absolute left-0 w-full">
                                    <input
                                        type="text"
                                        value={searchFilter.LocationL}
                                        onChange={(e) => {
                                            setSearchFilter((prev) => ({
                                                ...prev,
                                                LocationL: e.target.value,
                                            }))
                                        }}
                                        onSubmit={(e) => e.preventDefault()}
                                        placeholder="Enter location"
                                        className="w-full p-2 rounded-md border border-gray-300 bg-[#181c23] text-white"
                                    />
                                </div>
                            )}

                        </div>
                        <div className="!mt-25">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setProjectTagsDrop((open) => !open)}
                            >
                                <label className="text-white font-medium">Set Project Tags to refine your search</label>
                                <ChevronDownIcon className={`transition-transform ${projectTagsDrop ? "rotate-180" : ""}`} />
                            </div>
                            {projectTagsDrop && (
                                <>
                                    <div className="flex flex-wrap !gap-2 !mb-2">
                                        {searchFilter.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="!bg-[#0B0809] px-4 py-1 rounded-md flex items-center justify-between !text-white !max-h-[45px] !text-md border border-[#2f3542] font-normal"
                                            >
                                                <span className="ml-4 text-left font-normal">{tag.trim()}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags = searchFilter.tags
                                                            .split(',')
                                                            .filter((_, i) => i !== index)
                                                            .join(',');
                                                        setSearchFilter(prev => ({
                                                            ...prev,
                                                            tags: newTags
                                                        }));
                                                    }}
                                                    className="pr-2 flex items-center justify-center !bg-transparent hover:text-white transition-colors relative"
                                                    style={{ fontSize: '2rem', color: '#b0b8c1', top: '7px' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add tags"
                                        onKeyDown={(e) => {
                                            if (e.key === ',' || e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                const newTag = input.value.trim();

                                                if (
                                                    newTag &&
                                                    searchFilter.tags.split(',').filter(tag => tag.trim()).length < 2
                                                ) {
                                                    const newTags = searchFilter.tags
                                                        ? `${searchFilter.tags},${newTag}`
                                                        : newTag;
                                                    setSearchFilter(prev => ({
                                                        ...prev,
                                                        tags: newTags
                                                    }));
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                        className="border border-gray-300 rounded-md !mt-5 p-2 bg-[#181c23] text-white"
                                    />
                                    <div className="text-sm text-gray-400 mt-1">
                                        {searchFilter.tags.split(',').filter(tag => tag.trim()).length}/2 tags
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="!mt-15">
                            <div
                                className="flex items-center justify-between cursor-pointer select-none"
                                onClick={() => setSkillTagsDrop((open) => !open)}
                            >
                                <label className="text-white font-medium">Set Skill tags to refine your search </label>
                                <ChevronDownIcon className={`transition-transform ${skillTagsDrop ? "rotate-180" : ""}`} />
                            </div>
                            {skillTagsDrop && (
                                <>
                                    <div className="flex flex-wrap !gap-2 !mb-2">
                                        {searchFilter.skills.split(',').filter(skill => skill.trim()).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="!bg-[#0B0809] px-4 py-1 rounded-md flex items-center justify-between !text-white !max-h-[45px] !text-md border border-[#2f3542] font-normal"
                                            >
                                                <span className="ml-4 text-left font-normal">{skill.trim()}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSkills = searchFilter.skills
                                                            .split(',')
                                                            .filter((_, i) => i !== index)
                                                            .join(',');
                                                        setSearchFilter(prev => ({
                                                            ...prev,
                                                            skills: newSkills
                                                        }));
                                                    }}
                                                    className="pr-2 flex items-center justify-center !bg-transparent hover:text-white transition-colors relative"
                                                    style={{ fontSize: '2rem', color: '#b0b8c1', top: '7px' }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add skills"
                                        onKeyDown={(e) => {
                                            if (e.key === ',' || e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                const newSkill = input.value.trim();

                                                if (
                                                    newSkill &&
                                                    searchFilter.skills.split(',').filter(skill => skill.trim()).length < 2
                                                ) {
                                                    const newSkills = searchFilter.skills
                                                        ? `${searchFilter.skills},${newSkill}`
                                                        : newSkill;
                                                    setSearchFilter(prev => ({
                                                        ...prev,
                                                        skills: newSkills
                                                    }));
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                        className="border border-gray-300 rounded-md !mt-5 p-2 bg-[#181c23] text-white"
                                    />
                                    <div className="text-sm text-gray-400 mt-1">
                                        {searchFilter.skills.split(',').filter(skill => skill.trim()).length}/2 skills
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div >
            </div>
            {/* Main content area with scrollable cards */}
            <div
                className="bg-black-100"
                style={{
                    marginLeft: "20%",
                    paddingTop: "120px",
                    minHeight: "100vh",
                    paddingBottom: "96px",
                    paddingLeft: "100px",
                    paddingRight: "100px",
                    overflowY: "auto",
                }}
            >
                <div
                    className="scroll-progress-bar"
                    style={{ width: `${scrollProgress}%` }}
                />
                <div style={{ minHeight: "0px" }} />
                <div className="grid grid-cols-2 gap-x-10 gap-y-8 px-10 py-10">
                    {projectCards.map((project, idx) => (
                        <Card key={idx} className="bg-black-100 text-white rounded-lg shadow p-4 min-w-[350px] min-h-[300px]">
                            <CardHeader>
                                <CardTitle className="text-xl !ml-3">{project.title}</CardTitle>
                                <CardTitle className="!mt-5 !ml-3"> Number of Collaborators Wanted </CardTitle>
                                <CardTitle className="!mt-2 !ml-3"> {project.collaborators} </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white-400 !ml-3">{project.description}</p>
                                <div className="flex items-center gap-2 !mt-4 !ml-3">
                                    <span className="text-sm text-gray-400">Tags:</span>
                                    {project.tags.map((tag, i) => (
                                        <span key={i} className="bg-[#0B0809] px-3 py-1 rounded-md text-xs text-white">{tag}</span>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center !items-center">
                                <button
                                    type="button"
                                    className="flourish-title !text-[#1f98f4] px-4 py-2 rounded !items-center"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    Explore Project
                                </button>
                                <ChevronDownIcon className="ml-2 text-blue-500 cursor-pointer" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {/* Popup Modal */}
                {selectedProject && (
                    <div
                        className="fixed left-0 top-0 w-full h-full flex items-center justify-center z-[999]"
                        style={{
                            background: "rgba(0,0,0,0.7)",
                        }}
                    >
                        <div
                            className="bg-[#181c23] rounded-lg shadow-lg p-10 relative flex flex-col items-center"
                            style={{
                                minWidth: "500px",
                                minHeight: "350px",
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                            }}
                        >
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-400"
                                aria-label="Close"
                            >
                                <X size={32} />
                            </button>
                            <h2 className="text-3xl font-bold mb-6 text-white">{selectedProject.title}</h2>
                            <div className="text-lg mb-4 text-white">
                                <strong>Number of Collaborators Wanted:</strong> {selectedProject.collaborators}
                            </div>
                            <div className="mb-4 text-white">{selectedProject.description}</div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-400">Tags:</span>
                                {selectedProject.tags.map((tag, i) => (
                                    <span key={i} className="bg-[#0B0809] px-3 py-1 rounded-md text-xs text-white">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className=" bottom-0 !mb-3 left-0 w-full z-50 flex justify-center py-4 bg-black-100 text-white">
                <Pagination
                    pageCount={10}
                    currentPage={currentPage}
                    onPageChange={(page: number) => setCurrentPage(page)}
                    className="bg-black-100 text-white"
                />
            </div>
        </>
    )
}

export default page








"use client"

import React from 'react'
import Navbar from '@/components/layout/navbar'
import Link from 'next/link'
import { FaLightbulb } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import SplitText from 'gsap/SplitText'
import gsap from 'gsap'
import { Pagination } from '@/components/ui/pagination'
import { ChevronDownIcon } from "lucide-react"

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

function page() {
    const [searchFilter, setSearchFilter] = useState<SearchFilter>({
        LocationS: { remote: false, inPerson: false },
        LocationL: '',
        skills: '',
        tags: ''
    })
    const [scrollProgress, setScrollProgress] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
    const [locationDrop, setLocationDrop] = useState(false)
    const [projectTagsDrop, setProjectTagsDrop] = useState(false)
    const [skillTagsDrop, setSkillTagsDrop] = useState(false)

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
    return (
        <>
            <div className="flex h-screen w-full flex-col bg-black-100 md:w-64">
                <Navbar />
                <div
                    className="scroll-progress-bar"
                    style={{ width: `${scrollProgress}%` }}
                />
                <div className="flex flex-row grow !mt-40 !ml-20 justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                    <form className="w-1/5 min-w-[220px] bg-black-100 text-white rounded-lg shadow p-4 relative"
                        onSubmit={(e) => {
                            e.preventDefault()
                        }
                        }
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
                                    <label className="flex items-center gap-5 cursor-pointer !mt-5">
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
                                    <label className="flex items-center gap-5 cursor-pointer">
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
                                <div className="!mt-5 bg-black-100 text-white rounded shadow p-2 z-50 absolute left-0 w-full">
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
                        <div className="!mt-20">
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

                </div>
                <div className="fixed bottom-5 left-0 w-full z-50 flex justify-center py-4 bg-black-100 text-white">
                    <Pagination
                        pageCount={10}
                        currentPage={currentPage}
                        onPageChange={(page: number) => setCurrentPage(page)}
                        className="bg-black-100 text-white"
                    />
                </div>
            </div>
        </>
    )
}

export default page
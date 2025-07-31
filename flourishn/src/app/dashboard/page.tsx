"use client"
import { useState, useEffect } from "react"
import Navbar from "@/components/layout/navbar"
import NotesApp from "./notes"
import ProfileUploader from "../signup/profileUploader";
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";


// Dashboard Sidebar Activity Feed Styles
const dashboardStyles = `
  .sidebar-section {
    margin-bottom: 32px !important;
  }
  .sidebar-title {
    font-size: 18px !important;
    font-weight: 600 !important;
    margin-bottom: 16px !important;
    color: #fff !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .activity-item {
    display: flex !important;
    gap: 12px !important;
    padding: 12px 0 !important;
    border-bottom: 1px solid #2f3542 !important;
    position: relative !important;
  }
  .activity-item:last-child {
    border-bottom: none !important;
  }
  .activity-item.urgent::before {
    content: '' !important;
    position: absolute !important;
    left: -8px !important;
    top: 16px !important;
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: #ef4444 !important;
  }
  .activity-item.notification::before {
    content: '' !important;
    position: absolute !important;
    left: -8px !important;
    top: 16px !important;
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: #1f98f4 !important;
  }
  .activity-avatar {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    flex-shrink: 0 !important;
  }
  .activity-avatar.user {
    background: #1f98f4 !important;
    color: white !important;
  }
  .activity-avatar.system {
    background: rgba(16, 185, 129, 0.2) !important;
    color: #10b981 !important;
    font-size: 14px !important;
  }
  .activity-avatar.notification {
    background: rgba(31, 152, 244, 0.2) !important;
    color: #1f98f4 !important;
    font-size: 14px !important;
  }
  .activity-avatar.urgent {
    background: rgba(239, 68, 68, 0.2) !important;
    color: #ef4444 !important;
    font-size: 14px !important;
  }
  .activity-content {
    flex: 1 !important;
  }
  .activity-text {
    font-size: 13px !important;
    color: #ccc !important;
    margin-bottom: 4px !important;
    line-height: 1.4 !important;
  }
  .activity-time {
    font-size: 11px !important;
    color: #888 !important;
  }
  .view-all-activity {
    color: #1f98f4 !important;
    font-size: 12px !important;
    text-decoration: none !important;
    margin-top: 12px !important;
    display: block !important;
    text-align: center !important;
    padding: 8px !important;
    border: 1px solid #1f98f4 !important;
    border-radius: 6px !important;
    transition: all 0.2s !important;
  }
  .view-all-activity:hover {
    background: #1f98f4 !important;
    color: #fff !important;
  }
`;

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
    image?: string
}





function SkillsRow({ skills = [] }: { skills: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
                <span
                    key={i}
                    className="!bg-[#1f2937] !text-[#1f98f4] !px-2 !py-1 !rounded !text-[12px] !font-medium !border !border-[#1f98f4]/20"
                >
                    {skill}
                </span>
            ))}
        </div>
    );
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getProjectCategory = (tags: string[]) => {
    if (tags?.some((tag) => tag.toLowerCase().includes("creative"))) return "Creative";
    else if (tags?.some((tag) => tag.toLowerCase().includes("business") || tag.toLowerCase().includes("impact"))) return "Business";
    return "Tech";
};

const getCategoryPlaceholder = (category: string) => {
    switch (category) {
        case 'Tech': return 'TECH PROJECT';
        case 'Creative': return 'CREATIVE PROJECT';
        case 'Business': return 'BUSINESS PROJECT';
        default: return 'PROJECT';
    }
};

const timeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }
    return "just now";
};

export default function DashboardPage() {
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

    // Show more/less toggles for each section
    const [showAllRecommended, setShowAllRecommended] = useState(false);
    const [showAllYour, setShowAllYour] = useState(false);
    const [showAllBookmarked, setShowAllBookmarked] = useState(false);
    const router = useRouter();
    const { user, isLoggedIn } = useUser();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login')
        }
    }, [isLoggedIn, router]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
            <Navbar showSearchBar={true} showSeparator={true} />
            {/* New Dashboard Sidebar */}
            <div className="!w-[320px] !bg-black !border-r !border-[#2f3542] !p-6 fixed top-[80px] left-0 z-40 flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Post Project Button */}
                <button className="!w-full !bg-[#1f98f4] !text-white !border-none !rounded-xl !py-4 !px-4 !text-base !font-semibold !cursor-pointer !transition-all !duration-200 !mb-8 !flex !items-center !justify-center !gap-2 hover:!bg-[#1a7bc8] hover:!-translate-y-[1px]">
                    <span className="!text-xl !font-bold">+</span>
                    Post New Project
                </button>

                {/* Activity Feed Section */}
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Activity Feed</h3>
                    {/* Urgent notification */}
                    <div className="activity-item urgent">
                        <div className="activity-avatar urgent">⚠️</div>
                        <div className="activity-content">
                            <div className="activity-text">Film project deadline tomorrow</div>
                            <div className="activity-time">3h ago</div>
                        </div>
                    </div>
                    {/* User activity */}
                    <div className="activity-item">
                        <div className="activity-avatar user">SM</div>
                        <div className="activity-content">
                            <div className="activity-text"><strong>Sarah</strong> joined Recipe App</div>
                            <div className="activity-time">2h ago</div>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-avatar user" style={{ background: '#f59e0b' }}>JC</div>
                        <div className="activity-content">
                            <div className="activity-text"><strong>Jordan</strong> updated film project</div>
                            <div className="activity-time">5h ago</div>
                        </div>
                    </div>
                    <a href="#" className="view-all-activity">View All Activity</a>
                </div>

                {/* Interests Section */}
                <div className="!mb-8">
                    <h3 className="!text-lg !font-semibold !mb-4 !text-white !flex !items-center !gap-2">Your Interests</h3>
                    <div className="!flex !flex-wrap !gap-2 !mb-4">
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">React</span>
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">UI/UX Design</span>
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">Mobile Apps</span>
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">AI/ML</span>
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">Sustainability</span>
                        <span className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]">Film</span>
                    </div>
                    <a href="#" className="!text-[#888] !text-xs !no-underline !py-2 !block !border-t !border-[#2f3542] !mt-3 !pt-3 hover:!text-[#1f98f4]">✏️ Edit interests</a>
                </div>
            </div>

            {/* Main content area with scrollable cards and notes */}
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
                {/* Recommended Projects */}
                <div className="!mb-10">
                    <div className="!flex !items-center !justify-between !mb-5">
                        <h2 className="!text-2xl !font-semibold !text-white">Recommended for You</h2>
                        <button
                            onClick={() => setShowAllRecommended((v) => !v)}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {showAllRecommended ? "Show Less" : "View All"}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                        {(showAllRecommended ? projectCards : projectCards.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.tags);
                            const isRemote = project.remote;
                            const locationBadgeText = isRemote ? "Remote" : "In Person";
                            const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                >
                                    {/* Project Image or Placeholder */}
                                    <div className="w-full h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                        <span className="text-[#666] text-xs uppercase tracking-wider">
                                            {getCategoryPlaceholder(category)}
                                        </span>
                                    </div>
                                    {/* Card Content */}
                                    <div className="!p-5 flex flex-col flex-1">
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start !gap-3 !mb-3">
                                            <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                                {project.title}
                                            </h3>
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0 ${category === "Tech" ? "bg-[#1d4ed8] text-[#dbeafe]" : category === "Creative" ? "bg-[#2a2a2a] text-[#e5e5e5]" : "bg-[#2a2a2a] text-[#e5e5e5]"}`}>{category}</span>
                                        </div>
                                        {/* In Person/Remote tag and location */}
                                        <div className="flex items-center !gap-2 !mb-3">
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#2a2a2a] text-[#e5e5e5]"}`}>{locationBadgeText}</span>
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
                                                    {getInitials(project.author?.name || "Unknown")}
                                                </div>
                                                <span className="!text-[#888] !text-sm !font-medium">
                                                    {project.author?.name || "Unknown Author"}
                                                </span>
                                            </div>
                                            <span className="!text-[13px] !text-gray-400">
                                                {timePosted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Your Projects */}
                <div className="!mb-10">
                    <div className="!flex !items-center !justify-between !mb-5">
                        <h2 className="!text-2xl !font-semibold !text-white">Your Projects</h2>
                        <button
                            onClick={() => setShowAllYour((v) => !v)}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {showAllYour ? "Show Less" : "Manage All"}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                        {(showAllYour ? projectCards : projectCards.slice(0, 3)).map((project, idx) => (
                            <div
                                key={project.id || idx}
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                            >
                                {/* Project Image or Placeholder */}
                                <div className="w-full h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                    <span className="text-[#666] text-xs uppercase tracking-wider">
                                        {getCategoryPlaceholder(getProjectCategory(project.tags))}
                                    </span>
                                </div>
                                {/* Card Content */}
                                <div className="!p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start !gap-3 !mb-3">
                                        <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                            {project.title}
                                        </h3>
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0 bg-[#1d4ed8] text-[#dbeafe]`}>
                                            {getProjectCategory(project.tags)}
                                        </span>
                                    </div>
                                    <div className="flex items-center !gap-2 !mb-3">
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium bg-[#1d4ed8] text-[#dbeafe]`}>
                                            {project.remote ? "Remote" : "In Person"}
                                        </span>
                                        {!project.remote && (
                                            <span className="!text-[13px] !text-gray-400">
                                                {project.location}
                                            </span>
                                        )}
                                    </div>
                                    <div className="!mb-4 flex-1">
                                        <p className="!text-gray-300 !text-sm leading-snug line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>
                                    <div className="!mb-4">
                                        <SkillsRow skills={project.skills || []} />
                                    </div>
                                    <div className="flex justify-between items-center !gap-3 !mt-auto">
                                        <div className="flex items-center !gap-2">
                                            <div className="w-7 h-7 !rounded-full bg-indigo-900 flex items-center justify-center !text-indigo-200 !text-xs !font-semibold flex-shrink-0">
                                                {getInitials(project.author?.name || "Unknown")}
                                            </div>
                                            <span className="!text-[#888] !text-sm !font-medium">
                                                {project.author?.name || "Unknown Author"}
                                            </span>
                                        </div>
                                        <span className="!text-[13px] !text-gray-400">
                                            {project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bookmarked Projects */}
                <div className="!mb-10">
                    <div className="!flex !items-center !justify-between !mb-5">
                        <h2 className="!text-2xl !font-semibold !text-white">Bookmarked Projects</h2>
                        <button
                            onClick={() => setShowAllBookmarked((v) => !v)}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {showAllBookmarked ? "Show Less" : "View All"}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                        {(showAllBookmarked ? projectCards : projectCards.slice(0, 3)).map((project, idx) => (
                            <div
                                key={project.id || idx}
                                className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                            >
                                {/* Project Image or Placeholder */}
                                <div className="w-full h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                    <span className="text-[#666] text-xs uppercase tracking-wider">
                                        {getCategoryPlaceholder(getProjectCategory(project.tags))}
                                    </span>
                                </div>
                                {/* Card Content */}
                                <div className="!p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start !gap-3 !mb-3">
                                        <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                            {project.title}
                                        </h3>
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0 bg-[#1d4ed8] text-[#dbeafe]`}>
                                            {getProjectCategory(project.tags)}
                                        </span>
                                    </div>
                                    <div className="flex items-center !gap-2 !mb-3">
                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium bg-[#1d4ed8] text-[#dbeafe]`}>
                                            {project.remote ? "Remote" : "In Person"}
                                        </span>
                                        {!project.remote && (
                                            <span className="!text-[13px] !text-gray-400">
                                                {project.location}
                                            </span>
                                        )}
                                    </div>
                                    <div className="!mb-4 flex-1">
                                        <p className="!text-gray-300 !text-sm leading-snug line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>
                                    <div className="!mb-4">
                                        <SkillsRow skills={project.skills || []} />
                                    </div>
                                    <div className="flex justify-between items-center !gap-3 !mt-auto">
                                        <div className="flex items-center !gap-2">
                                            <div className="w-7 h-7 !rounded-full bg-indigo-900 flex items-center justify-center !text-indigo-200 !text-xs !font-semibold flex-shrink-0">
                                                {getInitials(project.author?.name || "Unknown")}
                                            </div>
                                            <span className="!text-[#888] !text-sm !font-medium">
                                                {project.author?.name || "Unknown Author"}
                                            </span>
                                        </div>
                                        <span className="!text-[13px] !text-gray-400">
                                            {project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats and Quick Note Cards */}
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6 !mb-8">
                    {/* Stats Card */}
                    <div className="!bg-[#1a1a1a] !border !border-[#333] !rounded-xl !p-6">
                        <h3 className="!text-lg !font-semibold !mb-4 !text-white">Your Stats</h3>
                        <div className="!grid !grid-cols-2 !gap-4">
                            <div className="!bg-[#0f0f0f] !border !border-[#2f3542] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">4</div>
                                <div className="!text-xs !text-[#888]">Active Projects</div>
                            </div>
                            <div className="!bg-[#0f0f0f] !border !border-[#2f3542] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">12</div>
                                <div className="!text-xs !text-[#888]">Collaborations</div>
                            </div>
                            <div className="!bg-[#0f0f0f] !border !border-[#2f3542] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">7</div>
                                <div className="!text-xs !text-[#888]">Completed</div>
                            </div>
                            <div className="!bg-[#0f0f0f] !border !border-[#2f3542] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">3</div>
                                <div className="!text-xs !text-[#888]">Bookmarked</div>
                            </div>
                        </div>
                    </div>
                    {/* Quick Note Card */}
                    <div className="!bg-[#1a1a1a] !border !border-[#333] !rounded-xl !p-6">
                        <h3 className="!text-lg !font-semibold !mb-4 !text-white">Quick Note</h3>
                        <textarea
                            className="!w-full !h-32 !bg-[#0f0f0f] !border !border-[#2f3542] !rounded-lg !p-3 !text-white !text-sm !resize-none focus:!outline-none focus:!border-[#1f98f4] !transition-colors"
                            placeholder="Jot down a quick note..."
                        />
                        <div className="!flex !justify-end !mt-3">
                            <button className="!bg-[#1f98f4] !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium hover:!bg-[#1a7bc8] !transition-colors">
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="mt-16">
                    <NotesApp />
                </div>
                <div>
                    <ProfileUploader></ProfileUploader>
                </div>
            </div>
        </>
    )
}

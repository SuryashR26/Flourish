"use client"
import { useState } from "react"
import Navbar from "@/components/layout/navbar"
import NotesApp from "./notes"
import ProfileUploader from "../signup/profileUploader";

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

// Enhanced category colors with updated palette for project cards
const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
        case 'tech':
            return {
                primary: '#00D4FF', // Bright cyan
                bgColor: '#00B8E620',
                gradient: 'linear-gradient(135deg, #0891B2 0%, #00D4FF 50%, #67E8F9 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(8, 145, 178, 0.8) 0%, rgba(0, 212, 255, 0.6) 50%, rgba(103, 232, 249, 0.4) 100%)',
                textColor: '#E0F7FA'
            };
        case 'creative':
            return {
                primary: '#A855F7', // Vibrant purple
                bgColor: '#9333EA20',
                gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(124, 58, 237, 0.8) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(192, 132, 252, 0.4) 100%)',
                textColor: '#F3E8FF'
            };
        case 'business':
            return {
                primary: '#1E40AF', // Navy blue
                bgColor: '#1D4ED820',
                gradient: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #3B82F6 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(30, 58, 138, 0.8) 0%, rgba(30, 64, 175, 0.6) 50%, rgba(59, 130, 246, 0.4) 100%)',
                textColor: '#DBEAFE'
            };
        case 'environment':
            return {
                primary: '#059669', // Forest green
                bgColor: '#047857F20',
                gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(6, 78, 59, 0.8) 0%, rgba(5, 150, 105, 0.6) 50%, rgba(16, 185, 129, 0.4) 100%)',
                textColor: '#D1FAE5'
            };
        case 'research':
            return {
                primary: '#EA580C', // Bold deep orange
                bgColor: '#DC2626F20',
                gradient: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #FB923C 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(194, 65, 12, 0.8) 0%, rgba(234, 88, 12, 0.6) 50%, rgba(251, 146, 60, 0.4) 100%)',
                textColor: '#FED7AA'
            };
        default:
            return {
                primary: '#6B7280',
                bgColor: '#4B556320',
                gradient: 'linear-gradient(135deg, #4B5563 0%, #6B7280 50%, #9CA3AF 100%)',
                gradientOverlay: 'linear-gradient(135deg, rgba(75, 85, 99, 0.8) 0%, rgba(107, 114, 128, 0.6) 50%, rgba(156, 163, 175, 0.4) 100%)',
                textColor: '#F3F4F6'
            };
    }
};

const getProjectCategory = (tags: string[]) => {
    const tagString = tags.join(' ').toLowerCase();
    if (tagString.includes('creative') || tagString.includes('design') || tagString.includes('art') ||
        tagString.includes('film') || tagString.includes('podcast') || tagString.includes('storytelling')) {
        return 'Creative';
    }
    if (tagString.includes('business') || tagString.includes('impact') || tagString.includes('startup') ||
        tagString.includes('marketplace') || tagString.includes('fintech')) {
        return 'Business';
    }
    if (tagString.includes('sustainability') || tagString.includes('environment') || tagString.includes('policy')) {
        return 'Environment';
    }
    if (tagString.includes('research') || tagString.includes('study') || tagString.includes('analysis')) {
        return 'Research';
    }
    return 'Tech';
};

const getCategoryPlaceholder = (category: string) => {
    switch (category) {
        case 'Creative': return 'Creative';
        case 'Business': return 'Business';
        case 'Environment': return 'Environment';
        case 'Research': return 'Research';
        default: return 'Tech';
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
    // Recommended projects for the user
    const recommendedProjects: Project[] = [
        {
            id: 1,
            title: "AI-Powered Study Group Platform",
            collaborators: 3,
            description:
                "Creating an AI-powered platform that matches students for study groups based on learning styles and schedules. Full-stack project with machine learning integration.",
            tags: ["#tech", "#ai", "#education", "#machine-learning"],
            skills: ["Machine Learning", "React", "Node.js", "Python", "TensorFlow"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 1,
                name: "Maya Thompson",
                avatar: "/avatar1.jpg",
            },
            createdAt: "2025-6-15",
        },
        {
            id: 2,
            title: "Campus Sustainability Initiative",
            collaborators: 4,
            description:
                "Building a comprehensive plan to reduce campus carbon footprint by 40% over the next 5 years. Looking for environmental science students and data analysts.",
            tags: ["#environment", "#sustainability", "#research", "#policy"],
            skills: ["Data Analysis", "Research", "Environmental Science", "Policy Writing"],
            location: "Palo Alto, CA",
            remote: false,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 2,
                name: "Alex Rivera",
                avatar: "/avatar2.jpg",
            },
            createdAt: "2025-8-15",
        },
        {
            id: 3,
            title: "Student Film: Digital Nomad",
            collaborators: 2,
            description:
                "Short film about remote work culture among Gen Z. Need cinematographer, sound engineer, and editor. Shooting starts next month.",
            tags: ["#creative", "#film", "#storytelling", "#documentary"],
            skills: ["Cinematography", "Video Editing", "Sound Design", "Adobe Premiere"],
            location: "Berkeley, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 3,
                name: "Jordan Chen",
                avatar: "/avatar3.jpg",
            },
            createdAt: "2025-5-15",
        },
        {
            id: 4,
            title: "Student Marketplace App",
            collaborators: 3,
            description:
                "Buy/sell platform specifically for college students. Like Facebook Marketplace but with student verification and campus-specific features.",
            tags: ["#business", "#mobile", "#marketplace", "#fintech"],
            skills: ["React Native", "Backend Development", "Product Design", "Payment Integration"],
            location: "Mountain View, CA",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 4,
                name: "Lisa Wang",
                avatar: "/avatar4.jpg",
            },
        },
        {
            id: 5,
            title: "Climate Data Visualization Portal",
            collaborators: 2,
            description:
                "Create a portal for visualizing climate and weather data. Need data scientist and frontend dev for interactive charts and maps.",
            tags: ["#environment", "#data", "#visualization", "#research"],
            skills: ["Python", "D3.js", "React", "Pandas"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "advanced",
            author: {
                id: 5,
                name: "Olivia Brown",
                avatar: "/avatar5.jpg",
            },
        },
        {
            id: 6,
            title: "Campus Mental Health Podcast",
            collaborators: 2,
            description:
                "Weekly podcast discussing student mental health with expert interviews. Need audio editor, graphic designer, and social media manager.",
            tags: ["#creative", "#podcast", "#mentalhealth", "#community"],
            skills: ["Audio Editing", "Graphic Design", "Social Media", "Content Creation"],
            location: "San Francisco, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 6,
                name: "Kai Patel",
                avatar: "/avatar6.jpg",
            },
        },
    ]

    // User's own projects
    const userProjects: Project[] = [
        {
            id: 101,
            title: "iOS Recipe App",
            collaborators: 2,
            description:
                "Mobile app for sharing and discovering recipes with social features. Currently in development phase, looking for UI/UX designer and backend developer.",
            tags: ["#business","#mobile", "#ios", "#food", "#social"],
            skills: ["Swift", "UI/UX Design", "Backend Development", "Firebase"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 101,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2025-01-15",
        },
        {
            id: 102,
            title: "Campus Event Planner",
            collaborators: 1,
            description:
                "Web application for organizing and managing campus events. Features include event creation, RSVP system, and calendar integration.",
            tags: ["#web", "#events", "#campus", "#organization"],
            skills: ["React", "Node.js", "MongoDB", "Calendar API"],
            location: "Stanford, CA",
            remote: false,
            status: "active",
            difficulty: "beginner",
            author: {
                id: 102,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2025-01-10",
        },
        {
            id: 103,
            title: "Study Timer with Pomodoro",
            collaborators: 0,
            description:
                "Simple but effective study timer app with Pomodoro technique integration. Built with React and includes statistics tracking.",
            tags: ["#productivity", "#web", "#pomodoro", "#study"],
            skills: ["React", "JavaScript", "CSS", "Local Storage"],
            location: "Remote",
            remote: true,
            status: "completed",
            difficulty: "beginner",
            author: {
                id: 103,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2024-12-20",
        },
        {
            id: 104,
            title: "Local Restaurant Review Platform",
            collaborators: 1,
            description:
                "Platform for reviewing local restaurants with photo uploads and rating system. Focus on student-friendly dining options.",
            tags: ["#web", "#reviews", "#food", "#local"],
            skills: ["React", "Express.js", "PostgreSQL", "Image Upload"],
            location: "Palo Alto, CA",
            remote: false,
            status: "paused",
            difficulty: "intermediate",
            author: {
                id: 104,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2023-11-15",
        },
        {
            id: 105,
            title: "Weather Dashboard",
            collaborators: 0,
            description:
                "Personal weather dashboard with multiple city tracking and weather alerts. Uses OpenWeatherMap API and displays data in charts.",
            tags: ["#web", "#weather", "#api", "#dashboard"],
            skills: ["JavaScript", "Chart.js", "API Integration", "CSS"],
            location: "Remote",
            remote: true,
            status: "completed",
            difficulty: "beginner",
            author: {
                id: 105,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2023-10-30",
        },
        {
            id: 106,
            title: "Fitness Tracker App",
            collaborators: 1,
            description:
                "Mobile app for tracking workouts and fitness goals. Includes progress charts, workout plans, and social sharing features.",
            tags: ["#mobile", "#fitness", "#health", "#tracking"],
            skills: ["React Native", "Firebase", "Charts", "Push Notifications"],
            location: "Remote",
            remote: true,
            status: "active",
            difficulty: "intermediate",
            author: {
                id: 106,
                name: "You",
                avatar: "/your-avatar.jpg",
            },
            createdAt: "2024-01-05",
        },
    ]

    // Show more/less toggles for each section
    const [showAllRecommended, setShowAllRecommended] = useState(false);
    const [showAllYour, setShowAllYour] = useState(false);
    const [showAllBookmarked, setShowAllBookmarked] = useState(false);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
            <Navbar showSearchBar={true} showDashboard={true} showSeparator={true} />
            {/* New Dashboard Sidebar */}
            <div className="!w-[320px] !bg-black !border-r !border-[#2f3542] !p-6 fixed top-[80px] left-0 z-40 flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Post Project Button */}
                <button className="!w-full !bg-black !text-[#1f98f4] !border !border-[#1f98f4] !rounded-xl !py-4 !px-4 !text-base !font-semibold !cursor-pointer !transition-all !duration-200 !mb-8 !flex !items-center !justify-center !gap-2 hover:!bg-[#1f98f4] hover:!text-white">
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
                        {(showAllRecommended ? recommendedProjects : recommendedProjects.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.tags);
                            const categoryColors = getCategoryColor(category);
                            const isRemote = project.remote;
                            const locationBadgeText = isRemote ? "Remote" : "In Person";
                            const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                >
                                    {/* Project Image or Category Gradient Background */}
                                    <div 
                                        className="w-full h-32 flex items-center justify-center relative overflow-hidden"
                                        style={{ background: categoryColors.gradient }}
                                    >
                                        {/* Optional overlay for better text readability */}
                                        <div 
                                            className="absolute inset-0"
                                            style={{ background: categoryColors.gradientOverlay }}
                                        />
                                        <span 
                                            className="relative text-xs uppercase tracking-wider font-semibold drop-shadow-lg z-10"
                                            style={{ color: categoryColors.textColor }}
                                        >
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
                                            <span
                                                className="!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0"
                                                style={{
                                                    backgroundColor: categoryColors.bgColor,
                                                    color: categoryColors.primary,
                                                    border: `1px solid ${categoryColors.primary}20`
                                                }}
                                            >
                                                {category}
                                            </span>
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
                        {(showAllYour ? userProjects : userProjects.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.tags);
                            const categoryColors = getCategoryColor(category);
                            const isRemote = project.remote;
                            const locationBadgeText = isRemote ? "Remote" : "In Person";
                            const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                >
                                    {/* Project Image or Category Gradient Background */}
                                    <div 
                                        className="w-full h-32 flex items-center justify-center relative overflow-hidden"
                                        style={{ background: categoryColors.gradient }}
                                    >
                                        {/* Optional overlay for better text readability */}
                                        <div 
                                            className="absolute inset-0"
                                            style={{ background: categoryColors.gradientOverlay }}
                                        />
                                        <span 
                                            className="relative text-xs uppercase tracking-wider font-semibold drop-shadow-lg z-10"
                                            style={{ color: categoryColors.textColor }}
                                        >
                                            {getCategoryPlaceholder(category)}
                                        </span>
                                    </div>
                                    {/* Card Content */}
                                    <div className="!p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start !gap-3 !mb-3">
                                            <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                                {project.title}
                                            </h3>
                                            <span
                                                className="!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0"
                                                style={{
                                                    backgroundColor: categoryColors.bgColor,
                                                    color: categoryColors.primary,
                                                    border: `1px solid ${categoryColors.primary}20`
                                                }}
                                            >
                                                {category}
                                            </span>
                                        </div>
                                        <div className="flex items-center !gap-2 !mb-3">
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#2a2a2a] text-[#e5e5e5]"}`}>
                                                {locationBadgeText}
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
                                                {timePosted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                        {(showAllBookmarked ? recommendedProjects : recommendedProjects.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.tags);
                            const categoryColors = getCategoryColor(category);
                            const isRemote = project.remote;
                            const locationBadgeText = isRemote ? "Remote" : "In Person";
                            const timePosted = project.createdAt ? timeAgo(new Date(project.createdAt)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#555] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                >
                                    {/* Project Image or Category Gradient Background */}
                                    <div 
                                        className="w-full h-32 flex items-center justify-center relative overflow-hidden"
                                        style={{ background: categoryColors.gradient }}
                                    >
                                        {/* Optional overlay for better text readability */}
                                        <div 
                                            className="absolute inset-0"
                                            style={{ background: categoryColors.gradientOverlay }}
                                        />
                                        <span 
                                            className="relative text-xs uppercase tracking-wider font-semibold drop-shadow-lg z-10"
                                            style={{ color: categoryColors.textColor }}
                                        >
                                            {getCategoryPlaceholder(category)}
                                        </span>
                                    </div>
                                    {/* Card Content */}
                                    <div className="!p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start !gap-3 !mb-3">
                                            <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                                                {project.title}
                                            </h3>
                                            <span
                                                className="!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0"
                                                style={{
                                                    backgroundColor: categoryColors.bgColor,
                                                    color: categoryColors.primary,
                                                    border: `1px solid ${categoryColors.primary}20`
                                                }}
                                            >
                                                {category}
                                            </span>
                                        </div>
                                        <div className="flex items-center !gap-2 !mb-3">
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#2a2a2a] text-[#e5e5e5]"}`}>
                                                {locationBadgeText}
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
                                                {timePosted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

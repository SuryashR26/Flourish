"use client"
import { useState, useEffect, useCallback } from "react"
import Navbar from "@/components/layout/navbar"
// import NotesApp from "./notes"
import ProfileUploader from "../signup/profileUploader";
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";

import { getBookmarkedPosts, getUserPosts, getRecommendedProjects, getNotifications, markNotificationsRead } from "@/api/apiClient";


import { Project, Notification } from '@/app/types/projectTypes';


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
    border-bottom: 1px solid #e2e5ea !important;
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
    color: #6b7280 !important;
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




function SkillsRow({ skills = [] }: { skills: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
                <span
                    key={i}
                    className="!bg-[#eef0f3] !text-[#1f98f4] !px-2 !py-1 !rounded !text-[12px] !font-medium !border !border-[#1f98f4]/20"
                >
                    {skill}
                </span>
            ))}
        </div>
    );
}



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

const getProjectCategory = (tags: string[] = []) => {
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


    // Show more/less toggles for each section
    const [showAllYour, setShowAllYour] = useState(false);
    const [showAllBookmarked, setShowAllBookmarked] = useState(false);
    const router = useRouter();
    const { user, isLoggedIn, isInitialized } = useUser();
    const [showProfileUploader, setShowProfileUploader] = useState(true);
    const [bookmarkedProjects, setBookmarkedProject] = useState<Project[]>([]);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([]);
    const [unreadNotification, setUnreadNotification] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchPosts = useCallback(async () => {
        try {
            const result = await getBookmarkedPosts();
            const result2 = await getUserPosts();
            const result3 = await getRecommendedProjects();
            const result4 = await getNotifications()
            setNotifications(result4)
            setUserProjects(result2);
            setBookmarkedProject(result);
            setRecommendedProjects(result3);

        } catch (error) {
            console.error('Search failed:', error);
        }
    }, []);

    const viewAllNotifications = async () => {
        try {
            await markNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
            );
            setUnreadNotification(false);
            router.push(`/statistics?query=${encodeURIComponent('Notifications')}`);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };


    useEffect(() => {
        // Only fetch data if user is authenticated
        if (isInitialized && isLoggedIn) {
            fetchPosts();
        }
    }, [isInitialized, isLoggedIn, fetchPosts]);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const hasUnread = notifications.some((notif) => notif.read_at === "unread");
            setUnreadNotification(hasUnread);
        } else {
            setUnreadNotification(false);
        }
    }, [notifications]);




    useEffect(() => {
        const firstTime = localStorage.getItem("firstTimeSignUp");
        console.log("first-time state is" + firstTime)

        if (user?.personal_preferences === null) {
            setShowProfileUploader(true);

        }

        if (isInitialized && !isLoggedIn) {
            router.push("/login");
        }
    }, [isInitialized, isLoggedIn, router]);

    useEffect(() => {
        if (showProfileUploader) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [showProfileUploader]);

    // Don't render content if user is not logged in (will redirect)
    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
            <Navbar showSearchBar={true} showSeparator={true} />
            {/* New Dashboard Sidebar */}
            <div className="!w-[320px] !bg-white !border-r !border-[#e2e5ea] !p-6 fixed top-[80px] left-0 z-40 flex flex-col overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Post Project Button */}
                <button className="!w-full !bg-white !text-[#1f98f4] !border !border-[#1f98f4] !rounded-xl !py-4 !px-4 !text-base !font-semibold !cursor-pointer !transition-all !duration-200 !mb-8 !flex !items-center !justify-center !gap-2 hover:!bg-[#1f98f4] hover:!text-white">
                    <span className="!text-xl !font-bold">+</span>
                    Post New Project
                </button>

                {/* Activity Feed Section */}
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Activity Feed</h3>

                    {notifications && notifications.length > 0 ? (
                        notifications
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // newest first
                            .slice(0, 3)
                            .map((notif, index) => {
                                return (
                                    <div key={index} className="activity-item">
                                        <div className="activity-avatar user">
                                            {notif.type !== 'view' ? (
                                                <img
                                                    src={notif?.user_image || "/images/defaultProfile.jpg"}
                                                    alt={user?.first_name || "User"}
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "/images/defaultProfile.jpg";
                                                    }}
                                                />
                                            ) : (
                                                '⚡'
                                            )}
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-text">{notif.message}</div>
                                            {notif.created_at && (
                                                <div className="activity-time">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <p className="text-sm">You’ll see updates here when someone interacts with your projects.</p>
                        </div>
                    )}

                    <a
                        href="#"
                        className="view-all-activity"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            viewAllNotifications();
                        }}
                    >
                        View All
                        {unreadNotification && (
                            <span className="absolute right-10 w-2 h-2 !bg-red-500 rounded-full" />
                        )}
                    </a>
                </div>


                {/* Interests Section */}
                <div className="!mb-8">
                    <h3 className="!text-lg !font-semibold !mb-4 !text-gray-900 !flex !items-center !gap-2">Your Interests</h3>
                    <div className="!flex !flex-wrap !gap-2 !mb-4">
                        {user?.personal_preferences?.length ? (
                            user.personal_preferences.map((interest, index) => (
                                <span
                                    key={index}
                                    className="!bg-[rgba(31,152,244,0.1)] !text-[#1f98f4] !py-1.5 !px-3 !rounded-2xl !text-xs !font-medium !border !border-[rgba(31,152,244,0.2)] !cursor-pointer !transition-all !duration-200 hover:!bg-[rgba(31,152,244,0.2)]"
                                >
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <p>No interests specified.</p>
                        )}
                    </div>

                    <button
                        onClick={() => window.location.href = '/settings'}
                        className="!text-[#6b7280] !text-xs !no-underline !py-2 !block !border-t !border-[#e2e5ea] !mt-3 !pt-3 hover:!text-[#1f98f4] !bg-transparent !border-none !cursor-pointer !w-full !text-left"
                    >
                        ✏️ Edit interests
                    </button>
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
                        <h2 className="!text-2xl !font-semibold !text-gray-900">Recommended for You</h2>
                        <button
                            onClick={() => {
                                localStorage.setItem(
                                    "interests",
                                    JSON.stringify(user?.personal_preferences || {})
                                );


                                router.push("/search");
                            }}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {"View All"}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                        {(recommendedProjects.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.project_tags);
                            const categoryColors = getCategoryColor(category);
                            const isRemote = project.location_preference;
                            const locationBadgeText = isRemote ? "Remote" : "In Person";
                            const timePosted = project.created_at ? timeAgo(new Date(project.created_at)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#e2e5ea] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#d7dbe1] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                >
                                    {/* Project Image or Category Gradient Background */}
                                    {project.photourl ? (
                                        <img
                                            src={project.photourl}
                                            alt={project.title}
                                            className="w-full h-32 object-cover rounded-none"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-32 flex items-center justify-center relative overflow-hidden"
                                            style={{ background: getCategoryColor(category).gradient }}
                                        >
                                            <div
                                                className="absolute inset-0"
                                                style={{ background: getCategoryColor(category).gradientOverlay }}
                                            />
                                            <span
                                                className="relative text-xs uppercase tracking-wider font-semibold drop-shadow-lg z-10"
                                                style={{ color: getCategoryColor(category).textColor }}
                                            >
                                                {getCategoryPlaceholder(category)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Card Content */}
                                    <div className="!p-5 flex flex-col flex-1">
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start !gap-3 !mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
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
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#eef0f3] text-[#e5e5e5]"}`}>{locationBadgeText}</span>
                                            {!isRemote && (
                                                <span className="!text-[13px] !text-gray-400">
                                                    {project.location}
                                                </span>
                                            )}
                                        </div>
                                        {/* Description */}
                                        <div className="!mb-4 flex-1">
                                            <p className="!text-gray-600 !text-sm leading-snug line-clamp-3">
                                                {project.content}
                                            </p>
                                        </div>
                                        {/* Skills Section */}
                                        <div className="!mb-4">
                                            <SkillsRow skills={project.skill_tags || []} />
                                        </div>
                                        {/* Footer */}
                                        <div className="flex justify-between items-center !gap-3 !mt-auto">
                                            <div className="flex items-center !gap-2">
                                                <div className="w-7 h-7 !rounded-full bg-indigo-100 flex items-center justify-center !text-indigo-700 !text-xs !font-semibold flex-shrink-0">
                                                    <img
                                                        src={project.user_image || '/images/defaultProfile.jpg'}
                                                        alt={project.user_name || 'User'}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null; // prevents infinite loop if fallback fails
                                                            e.currentTarget.src = '/images/defaultProfile.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <span className="!text-[#6b7280] !text-sm !font-medium">
                                                    {project.user_name || "Unknown Author"}
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
                        <h2 className="!text-2xl !font-semibold !text-gray-900">Your Projects</h2>
                        <button
                            onClick={() => setShowAllYour((v) => !v)}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {showAllYour ? "Show Less" : "Manage All"}
                        </button>
                    </div>

                    {userProjects && userProjects.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                        {(showAllYour ? userProjects : userProjects.slice(0, 3)).map((project, idx) => {
                            const category = getProjectCategory(project.project_tags);
                            const categoryColors = getCategoryColor(category);
                            const isRemote = project.location_preference;
                            const locationBadgeText = isRemote === 'remote' ? "Remote" : "In Person";
                            const timePosted = project.created_at ? timeAgo(new Date(project.created_at)) : "recently";
                            return (
                                <div
                                    key={project.id || idx}
                                    className="bg-[#1a1a1a] border border-[#e2e5ea] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#d7dbe1] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
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
                                            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
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
                                            <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#eef0f3] text-[#e5e5e5]"}`}>
                                                {locationBadgeText}
                                            </span>
                                            {!project.location_preference && (
                                                <span className="!text-[13px] !text-gray-400">
                                                    {project.location}
                                                </span>
                                            )}
                                        </div>
                                        <div className="!mb-4 flex-1">
                                            <p className="!text-gray-600 !text-sm leading-snug line-clamp-3">
                                                {project.content}
                                            </p>
                                        </div>
                                        <div className="!mb-4">
                                            <SkillsRow skills={project.skill_tags || []} />
                                        </div>
                                        <div className="flex justify-between items-center !gap-3 !mt-auto">
                                            <div className="flex items-center !gap-2">
                                                <div className="w-7 h-7 !rounded-full bg-indigo-100 flex items-center justify-center !text-indigo-700 !text-xs !font-semibold flex-shrink-0">
                                                    <img
                                                        src={user?.profileurl || '/images/defaultProfile.jpg'}
                                                        alt={project.user_name || 'User'}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null; // prevents infinite loop if fallback fails
                                                            e.currentTarget.src = '/images/defaultProfile.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <span className="!text-[#6b7280] !text-sm !font-medium">
                                                    {project.user_name || "Unknown Author"}
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
                    </div>) : (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg font-semibold mb-2">No projects yet</p>
                            <p className="text-sm">Start your first project to showcase your ideas</p>
                        </div>
                    )}
                </div>*

                {/* Bookmarked Projects */}
                <div className="!mb-10">
                    <div className="!flex !items-center !justify-between !mb-5">
                        <h2 className="!text-2xl !font-semibold !text-gray-900">Bookmarked Projects</h2>
                        <button
                            onClick={() => setShowAllBookmarked((v) => !v)}
                            className="!text-[#1f98f4] !no-underline !text-sm !font-medium !py-2 !px-4 !border !border-[#1f98f4] !rounded-lg !transition-all !duration-200 hover:!bg-[#1f98f4] hover:!text-white"
                        >
                            {showAllBookmarked ? "Show Less" : "View All"}
                        </button>
                    </div>
                    {bookmarkedProjects && bookmarkedProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                            {(showAllBookmarked
                                ? (bookmarkedProjects || [])
                                : (bookmarkedProjects || []).slice(0, 3)
                            ).map((project, idx) => {
                                const category = getProjectCategory(project.project_tags);
                                const categoryColors = getCategoryColor(category);
                                const isRemote = project.location_preference;
                                const locationBadgeText = isRemote === 'remote' ? "Remote" : "In Person";
                                const timePosted = project.created_at ? timeAgo(new Date(project.created_at)) : "recently";
                                return (
                                    <div
                                        key={project.id || idx}
                                        className="bg-[#1a1a1a] border border-[#e2e5ea] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#d7dbe1] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
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
                                                <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
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
                                                <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote === 'remote' ? "bg-[#1d4ed8] text-[#dbeafe]" : "bg-[#eef0f3] text-[#e5e5e5]"}`}>
                                                    {locationBadgeText}
                                                </span>
                                                {!project.location_preference && (
                                                    <span className="!text-[13px] !text-gray-400">
                                                        {project.location}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="!mb-4 flex-1">
                                                <p className="!text-gray-600 !text-sm leading-snug line-clamp-3">
                                                    {project.content}
                                                </p>
                                            </div>
                                            <div className="!mb-4">
                                                <SkillsRow skills={project.skill_tags || []} />
                                            </div>
                                            <div className="flex justify-between items-center !gap-3 !mt-auto">
                                                <div className="flex items-center !gap-2">
                                                    <div className="w-7 h-7 !rounded-full bg-indigo-100 flex items-center justify-center !text-indigo-700 !text-xs !font-semibold flex-shrink-0">
                                                        <img
                                                            src={project.user_image || '/images/defaultProfile.jpg'}
                                                            alt={project.user_name || 'User'}
                                                            className="w-full h-full object-cover rounded-full"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null; // prevents infinite loop if fallback fails
                                                                e.currentTarget.src = '/images/defaultProfile.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="!text-[#6b7280] !text-sm !font-medium">
                                                        {project.user_name || "Unknown Author"}
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
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg font-semibold mb-2">No bookmarked projects yet</p>
                            <p className="text-sm">Save interesting projects to easily find them later</p>
                        </div>
                    )}
                </div>

                {/* Stats and Quick Note Cards */}
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6 !mb-8">
                    {/* Stats Card */}
                    <div className="!bg-[#1a1a1a] !border !border-[#e2e5ea] !rounded-xl !p-6">
                        <h3 className="!text-lg !font-semibold !mb-4 !text-gray-900">Your Stats</h3>
                        <div className="!grid !grid-cols-2 !gap-4">
                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">4</div>
                                <div className="!text-xs !text-[#6b7280]">Active Projects</div>
                            </div>
                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">12</div>
                                <div className="!text-xs !text-[#6b7280]">Total Views</div>
                            </div>
                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">7</div>
                                <div className="!text-xs !text-[#6b7280]">Completed</div>
                            </div>
                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">3</div>
                                <div className="!text-xs !text-[#6b7280]">Bookmarked</div>
                            </div>
                        </div>
                    </div>
                    {/* Quick Note Card */}
                    {/* <div className="!bg-[#1a1a1a] !border !border-[#e2e5ea] !rounded-xl !p-6">
                        <h3 className="!text-lg !font-semibold !mb-4 !text-gray-900">Quick Note</h3>
                        <textarea
                            className="!w-full !h-32 !bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-3 !text-gray-900 !text-sm !resize-none focus:!outline-none focus:!border-[#1f98f4] !transition-colors"
                            placeholder="Jot down a quick note..."
                        />
                        <div className="!flex !justify-end !mt-3">
                            <button className="!bg-[#1f98f4] !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium hover:!bg-[#1a7bc8] !transition-colors">
                                Save Note
                            </button>
                        </div>
                    </div>*/}
                </div>

                {/* Notes Section */}
                {/*<div className="mt-16">
                    <NotesApp />
                </div>*/}
            </div>

            {/* Profile Picture Uploader Modal - Outside of main content to avoid positioning issues */}
            {showProfileUploader && (
                <ProfileUploader />
            )}
        </>
    )
}

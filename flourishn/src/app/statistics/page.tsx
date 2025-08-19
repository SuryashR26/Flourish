"use client"
import { useState, useEffect, useCallback } from "react"
import Navbar from "@/components/layout/navbar"
// import NotesApp from "./notes"
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";

import { ChartLineDefault } from "@/components/ui/chart-line-default"
import { useSearchParams } from 'next/navigation';
import { getUserPosts, getNotifications, markNotificationsRead } from "@/api/apiClient";
import { BarChart3, Bell, FileText } from "lucide-react"

import { Project, Notification } from '@/app/types/projectTypes';

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
                gradient: 'linear-gradient(135deg, #7C3AED 0%,rgb(15, 13, 16) 50%, #C084FC 100%)',
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


export default function StatisticsPage() {

    const [page, setPage] = useState(1);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [notificationSelection, setNotificationSelection] = useState(1)
    const { user, isLoggedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const fetchPosts = useCallback(async () => {
        try {
            const result2 = await getUserPosts();
            const result4 = await getNotifications()
            await markNotificationsRead();
            if (result2)
                setNotifications(result4)
            setUserProjects(result2);

        } catch (error: any) {
            if (error.message.includes("401")) {
                router.push('/login')
            }
            console.error('Search failed:', error);
        }
    }, []);


    useEffect(() => {
        fetchPosts()
    }, []);

    useEffect(() => {
        if (query == 'Notifications') {
            setPage(2)
        }
    }, [query]);
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login')
        }
    }, [isLoggedIn]);


    return (
        <>
            <Navbar showSearchBar={true} showSeparator={true} />

            {/* Container with sidebar + main content */}
            <div className="flex">
                {/* Sidebar */}
                <div
                    className="fixed left-0 top-[80px] z-40 h-[calc(100vh-80px)] 
                             bg-black border-r border-[#2f3542] 
                             overflow-y-auto flex flex-col items-center 
                             w-[72px] p-3 lg:w-[320px] lg:p-6"
                >
                    <div className="flex flex-col items-center mb-4">
                        <div
                            className="
                        w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-32 lg:h-32 
                        rounded-full bg-indigo-900 !mt-8 flex items-center justify-center
                        text-indigo-200 text-xs font-semibold flex-shrink-0"
                        >
                            <img
                                src={user?.profileurl || "/images/defaultProfile.jpg"}
                                alt={user?.first_name || "User"}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = "/images/defaultProfile.jpg"
                                }}
                            />
                        </div>

                        <div className="hidden lg:block mt-3 text-center">
                            <p className="text-white font-semibold">Your Account</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {user?.first_name} {user?.last_name}
                            </p>
                        </div>
                    </div>

                    <nav className="!mt-4 lg:!ml-6 !gap-y-2 lg:mt-8 w-full">
                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-white font-medium transition-colors mb-2
                                    hover:bg-[#1f98f4] ${page === 1 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => setPage(1)}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="hidden lg:inline">Overview</span>
                        </button>

                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-white font-medium transition-colors mb-2
                                     hover:bg-[#1f98f4] ${page === 2 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => setPage(2)}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="hidden lg:inline">Notifications</span>
                        </button>

                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-white font-medium transition-colors
                                    hover:bg-[#1f98f4] ${page === 3 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => setPage(3)}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="hidden lg:inline">Your Posts</span>
                        </button>
                    </nav>
                </div>

                {/* Main content */}
                <div className="ml-[72px] lg:ml-[320px] flex-1 p-6 min-h-[calc(100vh-80px)] bg-black">
                    {page === 1 && (
                        <div className="p-4 flex flex-col justify-center items-center h-full">
                            <div className="w-[300px] h-[150px] sm:w-[400px] sm:h-[200px] lg:w-[700px] lg:h-[400px]">
                                <ChartLineDefault />
                            </div>
                        </div>
                    )}

                    {page === 2 && (
                        <div className="!w-full !max-w-4xl !mt-30 !ml-100 !px-4 !py-6">
                            {/* Header Section */}
                            <div className="!mb-8">
                                <h1 className="text-white text-3xl font-bold mb-2">Notifications</h1>
                                <p className="text-gray-400 text-base">Stay updated with your latest activity and engagement</p>
                            </div>

                            {/* Filter Tabs */}
                            <div className="!flex !gap-10 !mb-8  rounded-2xl p-2 w-fit border border-gray-700/30">
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 1
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    onClick={() => setNotificationSelection(1)}
                                >
                                    All Activity
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 2
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    onClick={() => setNotificationSelection(2)}
                                >
                                    Views
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl  font-medium transition-all duration-300 text-lg ${notificationSelection === 3
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    onClick={() => setNotificationSelection(3)}
                                >
                                    Clicks
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 4
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    onClick={() => setNotificationSelection(4)}
                                >
                                    Bookmarks
                                </button>
                            </div>

                            {/* Notifications Content */}
                            {notificationSelection === 1 && (
                                <div className="space-y-4">
                                    {notifications && notifications.length > 0 ? (
                                        notifications
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((notif, index) => {
                                                const initials = notif.actor_name
                                                    ? notif.actor_name
                                                        .split(" ")
                                                        .map((n: string) => n[0].toUpperCase())
                                                        .join("")
                                                    : "⚡"

                                                const avatarColors = [
                                                    "bg-gradient-to-br from-emerald-400 to-emerald-600",
                                                    "bg-gradient-to-br from-violet-400 to-violet-600",
                                                    "bg-gradient-to-br from-amber-400 to-amber-600",
                                                    "bg-gradient-to-br from-rose-400 to-rose-600",
                                                    "bg-gradient-to-br from-cyan-400 to-cyan-600",
                                                ]
                                                const avatarColor = avatarColors[index % avatarColors.length]

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl !p-6 !mb-5 hover:bg-gray-800/80 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300`}
                                                            >
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-gray-100 mb-3 font-medium">{notif.message}</div>
                                                                {notif.created_at && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <span className="flex items-center gap-2 text-gray-400">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            {new Date(notif.created_at).toLocaleTimeString([], {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </span>
                                                                        <span className="bg-gray-700/60 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                                                                            Activity
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    ) : (
                                        <div className="text-center py-20 text-gray-400">
                                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                                                <Bell className="w-8 h-8 !mt-23 !-mr-140  text-gray-500" />
                                            </div>
                                            <div className="text-xl font-semibold mb-2 text-gray-300">No notifications yet</div>
                                            <div className="text-gray-500 max-w-md mx-auto !ml-50">
                                                When you start getting activity on your posts, you'll see all the updates here
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {notificationSelection === 2 && (
                                <div className="space-y-4">
                                    {notifications && notifications.length > 0 ? (
                                        notifications
                                            .filter(notif => notif.type === "view")
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((notif, index) => {
                                                const initials = notif.actor_name
                                                    ? notif.actor_name
                                                        .split(" ")
                                                        .map((n: string) => n[0].toUpperCase())
                                                        .join("")
                                                    : "⚡"

                                                const avatarColors = [
                                                    "bg-gradient-to-br from-emerald-400 to-emerald-600",
                                                    "bg-gradient-to-br from-violet-400 to-violet-600",
                                                    "bg-gradient-to-br from-amber-400 to-amber-600",
                                                    "bg-gradient-to-br from-rose-400 to-rose-600",
                                                    "bg-gradient-to-br from-cyan-400 to-cyan-600",
                                                ]
                                                const avatarColor = avatarColors[index % avatarColors.length]

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl !p-6 !mb-5 hover:bg-gray-800/80 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300`}
                                                            >
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-gray-100 mb-3 font-medium">{notif.message}</div>
                                                                {notif.created_at && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <span className="flex items-center gap-2 text-gray-400">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            {new Date(notif.created_at).toLocaleTimeString([], {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </span>
                                                                        <span className="bg-gray-700/60 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                                                                            Activity
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    ) : (
                                        <div className="text-center py-20 text-gray-400">
                                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                                                <BarChart3 className="w-8 h-8 !mt-23 !-mr-140 text-gray-500" />
                                            </div>
                                            <div className="text-xl font-semibold mb-2 text-gray-300">No view notifications</div>
                                            <div className="text-gray-500">View notifications will appear here when available</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {notificationSelection === 3 && (
                                <div className="space-y-4">
                                    {notifications && notifications.length > 0 ? (
                                        notifications
                                            .filter(notif => notif.type === "click")
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((notif, index) => {
                                                const initials = notif.actor_name
                                                    ? notif.actor_name
                                                        .split(" ")
                                                        .map((n: string) => n[0].toUpperCase())
                                                        .join("")
                                                    : "⚡"

                                                const avatarColors = [
                                                    "bg-gradient-to-br from-emerald-400 to-emerald-600",
                                                    "bg-gradient-to-br from-violet-400 to-violet-600",
                                                    "bg-gradient-to-br from-amber-400 to-amber-600",
                                                    "bg-gradient-to-br from-rose-400 to-rose-600",
                                                    "bg-gradient-to-br from-cyan-400 to-cyan-600",
                                                ]
                                                const avatarColor = avatarColors[index % avatarColors.length]

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl !p-6 !mb-5 hover:bg-gray-800/80 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300`}
                                                            >
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-gray-100 mb-3 font-medium">{notif.message}</div>
                                                                {notif.created_at && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <span className="flex items-center gap-2 text-gray-400">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            {new Date(notif.created_at).toLocaleTimeString([], {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </span>
                                                                        <span className="bg-gray-700/60 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                                                                            Activity
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    ) : (

                                        <div className="text-center py-20 text-gray-400">
                                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                                                <FileText className="w-8 h-8 !mt-23 !-mr-140 text-gray-500" />
                                            </div>
                                            <div className="text-xl font-semibold mb-2 text-gray-300">No click notifications</div>
                                            <div className="text-gray-500">Click notifications will appear here when available</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {notificationSelection === 4 && (
                                <div className="space-y-4">
                                    {notifications && notifications.length > 0 ? (
                                        notifications
                                            .filter(notif => notif.type === "bookmark")
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((notif, index) => {
                                                const initials = notif.actor_name
                                                    ? notif.actor_name
                                                        .split(" ")
                                                        .map((n: string) => n[0].toUpperCase())
                                                        .join("")
                                                    : "⚡"

                                                const avatarColors = [
                                                    "bg-gradient-to-br from-emerald-400 to-emerald-600",
                                                    "bg-gradient-to-br from-violet-400 to-violet-600",
                                                    "bg-gradient-to-br from-amber-400 to-amber-600",
                                                    "bg-gradient-to-br from-rose-400 to-rose-600",
                                                    "bg-gradient-to-br from-cyan-400 to-cyan-600",
                                                ]
                                                const avatarColor = avatarColors[index % avatarColors.length]

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-800/60 border border-gray-700/40 rounded-2xl !p-6 !mb-5 hover:bg-gray-800/80 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-300`}
                                                            >
                                                                {initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-gray-100 mb-3 font-medium">{notif.message}</div>
                                                                {notif.created_at && (
                                                                    <div className="flex items-center gap-3 text-sm">
                                                                        <span className="flex items-center gap-2 text-gray-400">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            {new Date(notif.created_at).toLocaleTimeString([], {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </span>
                                                                        <span className="bg-gray-700/60 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium">
                                                                            Activity
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    ) : (
                                        <div className="text-center py-20 text-gray-400">
                                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                                                <Bell className="w-8 h-8 !mt-23 !-mr-130 text-gray-500" />
                                            </div>
                                            <div className="text-xl font-semibold mb-2 text-gray-300">No bookmark notifications</div>
                                            <div className="text-gray-500">Bookmark notifications will appear here when available</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {page === 3 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400 text-lg">Your Posts Page</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )

}
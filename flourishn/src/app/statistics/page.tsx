"use client"
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import Navbar from "@/components/layout/navbar"
// import NotesApp from "./notes"
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";
import { Pagination } from '@/components/ui/pagination'
import { ChartLineDefault } from "@/components/ui/chart-line-default"
import { ChartLineDefault2 } from "@/components/ui/chart-line-default2"
import { useSearchParams } from 'next/navigation';
import { getUserPosts, getNotifications, markNotificationsRead, getTotalPostBookmarks, getTotalPostClicks, getTotalPostViews } from "@/api/apiClient";
import { BarChart3, Bell, FileText } from "lucide-react"
import { X } from 'lucide-react'

import { Project, Notification } from '@/app/types/projectTypes';

const getCategoryColor = (category: string) => {
    if (!category) { category = 'tech' }
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
                    className={`skill-tag !py-1 !px-2 !rounded !text-[13px] !font-medium ${i < 2
                        ? 'bg-[#1d4ed8] text-[#dbeafe]'
                        : 'bg-[#eef0f3] text-[#e5e5e5]'
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




export default function StatisticsPage() {

    const [page, setPage] = useState(1);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userProjects, setUserProjects] = useState<Project[]>([]);
    const [notificationSelection, setNotificationSelection] = useState(1)
    const [selectedProject, setSelectedProject] = useState<null | Project>(null);
    const [currentPage, setCurrentPage] = useState(1)
    const { user, isLoggedIn } = useUser();
    const [postStats, setPostStats] = useState<{
        views: number;
        clicks: number;
        bookmarks: number;
    }>({
        views: 0,
        clicks: 0,
        bookmarks: 0,
    });
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

        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message.includes("401")) {
                    router.push('/login');
                }
                console.error('Search failed:', error);
            } else {
                console.error('Search failed with unknown error:', error);
            }
        }
    }, []);

    const projectPerPage = 10;

    const totalInteractions = postStats.views + postStats.clicks + postStats.bookmarks;

    const pageCount = Math.ceil(userProjects.length / projectPerPage);
    const paginatedProjects = userProjects.slice(
        (currentPage - 1) * projectPerPage,
        currentPage * projectPerPage
    );

    const fetchPostStats = async (postId: string) => {
        try {
            const [viewsRes, clicksRes, bookmarksRes] = await Promise.all([
                getTotalPostViews(postId),
                getTotalPostClicks(postId),
                getTotalPostBookmarks(postId),
            ]);

            setPostStats({
                views: viewsRes.total || 0,
                clicks: clicksRes.total || 0,
                bookmarks: bookmarksRes.total || 0,
            });
        } catch (error) {
            console.error("Error fetching post stats:", error);
            setPostStats({ views: 0, clicks: 0, bookmarks: 0 });
        }
    };

    useEffect(() => {
        fetchPosts()
    }, []);

    useEffect(() => {
        if (selectedProject?.id) {
            fetchPostStats(selectedProject.id);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (query === 'Notifications') {
            setPage(2);
        }
        if (query === 'yourPosts') {
            setPage(3);
        }
    }, [query, router, searchParams]);
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
                             bg-white border-r border-[#e2e5ea] 
                             overflow-y-auto flex flex-col items-center 
                             w-[72px] p-3 lg:w-[320px] lg:p-6"
                >
                    <div className="flex flex-col items-center mb-4">
                        <div
                            className="
                        w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 lg:w-32 lg:h-32 
                        rounded-full bg-indigo-100 !mt-8 flex items-center justify-center
                        text-indigo-700 text-xs font-semibold flex-shrink-0"
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
                            <p className="text-gray-900 font-semibold">Your Account</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {user?.first_name} {user?.last_name}
                            </p>
                        </div>
                    </div>

                    <nav className="!mt-4 lg:!ml-6 !gap-y-2 lg:mt-8 w-full">
                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-gray-900 font-medium transition-colors mb-2
                                    hover:bg-[#1f98f4] ${page === 1 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => {
                                setPage(1);
                                const newParams = new URLSearchParams(searchParams.toString());
                                newParams.delete('query');
                                router.replace(`?${newParams.toString()}`);
                            }}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="hidden lg:inline">Overview</span>
                        </button>

                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-gray-900 font-medium transition-colors mb-2
                                     hover:bg-[#1f98f4] ${page === 2 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => {
                                setPage(2);

                                const newParams = new URLSearchParams('');
                                newParams.set('query', 'Notifications'); // set query param
                                router.replace(`?${newParams.toString()}`);
                            }}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="hidden lg:inline">Notifications</span>
                        </button>

                        <button
                            className={`
                                    group w-full h-12 flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-5 rounded-lg text-gray-900 font-medium transition-colors
                                    hover:bg-[#1f98f4] ${page === 3 ? "bg-[#1f98f4]" : ""}
                                `}
                            onClick={() => {
                                setPage(3);

                                // Remove the query param so it doesn't trigger effects again
                                const newParams = new URLSearchParams('');
                                newParams.set('query', 'yourPosts'); // set query param
                                router.replace(`?${newParams.toString()}`);
                            }}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="hidden lg:inline">Your Posts</span>
                        </button>
                    </nav>
                </div>

                {/* Main content */}
                <div className="ml-[72px] lg:ml-[320px] flex-1 p-6 min-h-[calc(100vh-80px)] bg-white">
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
                                <h1 className="text-gray-900 text-3xl font-bold mb-2">Notifications</h1>
                                <p className="text-gray-400 text-base">Stay updated with your latest activity and engagement</p>
                            </div>

                            {/* Filter Tabs */}
                            <div className="!flex !gap-10 !mb-8  rounded-2xl p-2 w-fit border border-gray-200">
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 1
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setNotificationSelection(1)}
                                >
                                    All Activity
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 2
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setNotificationSelection(2)}
                                >
                                    Views
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl  font-medium transition-all duration-300 text-lg ${notificationSelection === 3
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setNotificationSelection(3)}
                                >
                                    Clicks
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-lg ${notificationSelection === 4
                                        ? "bg-[#1f98f4] text-white shadow-lg !px-6 !py-2"
                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
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
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 border border-gray-200 rounded-2xl !p-6 !mb-5 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-12 h-12 rounded-full flex-shrink-0  bg-[#1f98f4] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                                                            >
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
                                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
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
                                            <div className="text-xl font-semibold mb-2 text-gray-600">No notifications yet</div>
                                            <div className="text-gray-500 max-w-md mx-auto !ml-50">
                                                When you start getting activity on your posts, you`&apos;`ll see all the updates here
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
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 border border-gray-200 rounded-2xl !p-6 !mb-5 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center bg-[#1f98f4] justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                                                            >
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
                                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
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
                                            <div className="text-xl font-semibold mb-2 text-gray-600">No view notifications</div>
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
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 border border-gray-200 rounded-2xl !p-6 !mb-5 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                                                            >
                                                                <img
                                                                    src={notif?.user_image || "/images/defaultProfile.jpg"}
                                                                    alt={user?.first_name || "User"}
                                                                    className="w-full h-full object-cover rounded-full"
                                                                    onError={(e) => {
                                                                        e.currentTarget.onerror = null;
                                                                        e.currentTarget.src = "/images/defaultProfile.jpg";
                                                                    }}
                                                                />
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
                                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
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
                                            <div className="text-xl font-semibold mb-2 text-gray-600">No click notifications</div>
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
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 border border-gray-200 rounded-2xl !p-6 !mb-5 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                                                            >
                                                                <img
                                                                    src={notif?.user_image || "/images/defaultProfile.jpg"}
                                                                    alt={user?.first_name || "User"}
                                                                    className="w-full h-full object-cover rounded-full"
                                                                    onError={(e) => {
                                                                        e.currentTarget.onerror = null;
                                                                        e.currentTarget.src = "/images/defaultProfile.jpg";
                                                                    }}
                                                                />
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
                                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
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
                                            <div className="text-xl font-semibold mb-2 text-gray-600">No bookmark notifications</div>
                                            <div className="text-gray-500">Bookmark notifications will appear here when available</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {page === 3 && (
                        <div className="flex flex-col h-full">
                            <div className="!px-6 !py-4 !ml-100 !mt-30 ">
                                <h1 className="text-gray-900 text-3xl font-bold whitespace-nowrap">Your Posts</h1>
                            </div>


                            <div className="flex-1 !ml-100 !mr-10 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 !mt-3 !mb-2">
                                    {paginatedProjects.map((project, idx) => {
                                        const category = project.project_category
                                        /*const categoryClass = category === 'Tech'
                                            ? 'bg-blue-100/10 text-blue-400 border border-blue-400/20'
                                            : category === 'Creative'
                                                ? 'bg-pink-600/10 text-pink-300 border border-pink-300/20'
                                                : 'bg-green-100/10 text-green-400 border border-green-400/20';
                                            */
                                        const isRemote = project.location_preference;

                                        // const locationBadgeClass = isRemote ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-800';
                                        const locationBadgeText = isRemote === 'remote' ? 'Remote' : 'In Person';
                                        // const locationText = isRemote ? 'Open to remote collaboration' : project.location;
                                        const timePosted = project.created_at ? timeAgo(new Date(project.created_at)) : 'recently';

                                        return (
                                            <div
                                                key={project.id || idx}
                                                className="bg-[#1a1a1a] border border-[#e2e5ea] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col hover:border-[#d7dbe1] hover:-translate-y-0.5 hover:shadow-2xl min-h-[380px]"
                                                onClick={() => setSelectedProject(project)}
                                            >
                                                {/* Urgent indicator */}
                                                {/*{project.urgent && (
                                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase z-10">
                                        Due Soon
                                    </div>
                                )}*/}
                                                {project.is_draft && (
                                                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase z-10">
                                                        Draft
                                                    </div>
                                                )}

                                                {/* Project Image or Placeholder */}
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
                                                    <div className="flex justify-between items-start !gap-3 !mb-3 !mt-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">
                                                            {project.title}
                                                        </h3>
                                                        <span
                                                            className="!py-1 !px-2 !rounded !text-[13px] !font-medium flex-shrink-0"
                                                            style={{
                                                                backgroundColor: getCategoryColor(category).bgColor,
                                                                color: getCategoryColor(category).primary,
                                                                border: `1px solid ${getCategoryColor(category).primary}20`
                                                            }}
                                                        >
                                                            {category?.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {/* In Person/Remote tag and location */}
                                                    <div className="flex items-center !gap-2 !mb-3">
                                                        <span className={`!py-1 !px-2 !rounded !text-[13px] !font-medium ${isRemote === 'remote' ? 'bg-[#1d4ed8] text-[#dbeafe]' : 'bg-[#eef0f3] text-[#e5e5e5]'}`}>
                                                            {locationBadgeText}
                                                        </span>
                                                        {!isRemote && (
                                                            <span className="!text-[13px] !text-gray-400">
                                                                {project.location}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Description - Remove flex-1 and reduce margin */}
                                                    <div className="!mb-3">
                                                        <p className="!text-gray-600 !text-sm leading-snug line-clamp-3">
                                                            {project.content}
                                                        </p>
                                                    </div>

                                                    {/* Skills Section */}
                                                    <div className="!mb-4">
                                                        <SkillsRow skills={project.skill_tags || []} />
                                                    </div>

                                                    {/* Footer - This will stick to bottom */}
                                                    <div className="flex justify-between items-center !gap-3 !mt-auto">
                                                        <div className="flex items-center !gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                                                                {project.user_name || 'Unknown Author'}
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
                            </div>
                            <div className="flex flex-row">
                                {selectedProject && isLoggedIn && (
                                    <div
                                        className=" fixed left-0 !top-0 w-full h-full flex items-center justify-center !z-[10000] !p-4"
                                        style={{ background: "rgba(0,0,0,0.8)" }}
                                        onClick={e => { if (e.target === e.currentTarget) setSelectedProject(null); }}
                                    >
                                        <div className="flex flex-row gap-6 max-w-[90vw]">
                                            <div className="!bg-[#eef0f3] !border !border-[#e2e5ea] !rounded-2xl !w-[1200px] !max-h-[90vh] !overflow-y-auto !relative !shadow-2xl">
                                                <div className="!p-8 !pb-6 !border-b !border-[#e2e5ea] !relative">
                                                    <button
                                                        onClick={() => setSelectedProject(null)}
                                                        className="!absolute !top-5 !right-5 !text-[#6b7280] hover:!text-gray-900 !text-2xl !p-2 !rounded-lg hover:!bg-[#e2e5ea] !transition-colors"
                                                        aria-label="Close"
                                                    >
                                                        <X size={24} />
                                                    </button>

                                                    <h1 className="!text-3xl !font-bold !text-gray-900 !mb-4 !pr-12 !leading-tight">
                                                        {selectedProject.title || 'Untitled Project'}
                                                    </h1>

                                                    <div className="flex items-center !gap-3 !mb-4">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            <img
                                                                src={selectedProject.user_image || '/images/defaultProfile.jpg'}
                                                                alt={selectedProject.user_name || 'User'}
                                                                className="w-full h-full object-cover rounded-full"
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = '/images/defaultProfile.jpg';
                                                                }}
                                                            />

                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="!text-gray-900 !font-medium">
                                                                {selectedProject.user_name || 'Unknown Author'}
                                                            </div>
                                                            { /* <div className="!text-[#6b7280] !text-sm">
                                                                                {selectedProject.author?.title || 'Student'}
                                                                            </div> */}
                                                        </div>
                                                    </div>

                                                    <div className="flex !gap-2 flex-wrap">
                                                        {selectedProject.status && (
                                                            <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${selectedProject.status === 'active' ? '!bg-green-100 !text-green-800' :
                                                                selectedProject.status === 'completed' ? '!bg-blue-100 !text-blue-800' :
                                                                    '!bg-yellow-100 !text-yellow-800'
                                                                }`}>
                                                                {selectedProject.status}
                                                            </span>
                                                        )}
                                                        <span className={`!px-3 !py-1 !text-sm !font-medium !rounded-full ${selectedProject.location_preference === 'remote' ? '!bg-indigo-100 !text-indigo-700' : '!bg-green-100 !text-green-800'
                                                            }`}>
                                                            {selectedProject.location_preference === 'remote' ? 'Remote' : 'In Person'}
                                                        </span>
                                                        {/*selectedProject.urgent && (
                                                                            <span className="!px-3 !py-1 !text-sm !font-medium !rounded-full !bg-red-600 !text-white">
                                                                                Urgent
                                                                            </span>
                                                                        )*/}
                                                    </div>
                                                </div>

                                                <div className="!p-8">
                                                    {/* Project Details Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 !gap-6 !mb-8 !p-5 !bg-white/[0.02] !border !border-[#e2e5ea] !rounded-xl">
                                                        <div className="flex items-center !gap-3">
                                                            <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="!text-[#ccc] !text-sm">
                                                                {selectedProject.role_count || 0} collaborator{selectedProject.role_count !== 1 ? 's' : ''} needed
                                                            </span>
                                                        </div>

                                                        {selectedProject.difficulty && (
                                                            <div className="flex items-center !gap-3">
                                                                <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span className="!text-[#ccc] !text-sm !capitalize">
                                                                    {selectedProject.difficulty} level
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center !gap-3">
                                                            <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="!text-[#ccc] !text-sm">
                                                                {selectedProject.location_preference ? 'Remote collaboration' : selectedProject.location}
                                                            </span>
                                                        </div>

                                                        {selectedProject.time_commitment && (
                                                            <div className="flex items-center !gap-3">
                                                                <svg className="!w-5 !h-5 !text-[#1f98f4] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="!text-[#ccc] !text-sm">
                                                                    {selectedProject.time_commitment}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Project Description */}
                                                    <div className="!mb-8">
                                                        <h3 className="!text-lg !font-semibold !text-gray-900 !mb-3 flex items-center !gap-2">
                                                            <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                            Project Description
                                                        </h3>
                                                        <p className="!text-[#ccc] !leading-relaxed !text-[15px] !whitespace-pre-line">
                                                            {/*selectedProject.fullDescriptio*/ selectedProject.content || 'No description available'}
                                                        </p>
                                                    </div>

                                                    {/* Required Skills */}
                                                    {selectedProject.skill_tags && selectedProject.skill_tags.length > 0 && (
                                                        <div className="!mb-8">
                                                            <h3 className="!text-lg !font-semibold !text-gray-900 !mb-3 flex items-center !gap-2">
                                                                <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                                Required Skills
                                                            </h3>
                                                            <div className="flex flex-wrap !gap-2">
                                                                {selectedProject.skill_tags.map((skill, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="!bg-[#eef0f3] !text-[#1f98f4] !px-3 !py-2 !rounded-lg !text-sm !font-medium !border !border-[#1f98f4]/20"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Project Tags */}
                                                    {selectedProject.project_tags && selectedProject.project_tags.length > 0 && (
                                                        <div className="!mb-8">
                                                            <h3 className="!text-lg !font-semibold !text-gray-900 !mb-3 flex items-center !gap-2">
                                                                <div className="!w-1 !h-5 !bg-[#1f98f4] !rounded"></div>
                                                                Project Tags
                                                            </h3>
                                                            <div className="flex flex-wrap !gap-2">
                                                                {selectedProject.project_tags.map((tag, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="!bg-[#f4f5f7] !text-gray-600 !px-3 !py-2 !rounded-lg !text-sm !border !border-[#e2e5ea]"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col sm:flex-row !gap-3 !pt-6 !border-t !border-[#e2e5ea]">
                                                        <button
                                                            className="flex-1 !bg-[#1f98f4] !text-white !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1a7bc8] !transition-all !duration-200 hover:!-translate-y-0.5"
                                                            onClick={async () => {
                                                                setSelectedProject(null);
                                                            }}
                                                        >
                                                            Bookmark Project
                                                        </button>
                                                        <button
                                                            className="flex-1 !bg-transparent !text-[#1f98f4] !border !border-[#1f98f4] !px-6 !py-3 !rounded-xl !font-medium hover:!bg-[#1f98f4] hover:!text-white !transition-colors"
                                                            onClick={() => {
                                                                console.log('Contacting author:', selectedProject.user_name);
                                                                setSelectedProject(null);
                                                            }}
                                                        >
                                                            Contact {selectedProject.user_name?.split(' ')[0] || 'Author'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="!bg-[#eef0f3] border border-[#444] rounded-2xl !w-[1200px] max-h-[90vh] overflow-y-auto shadow-xl">
                                                {/* Header */}
                                                <div className="!p-8 !pb-6 !border-b !border-[#e2e5ea] !relative">
                                                    <button
                                                        onClick={() => setSelectedProject(null)}
                                                        className="!absolute !top-5 !right-5 !text-[#6b7280] hover:!text-gray-900 !text-2xl !p-2 !rounded-lg hover:!bg-[#e2e5ea] !transition-colors"
                                                        aria-label="Close"
                                                    >
                                                        <X size={24} />
                                                    </button>
                                                    <h1 className="!text-3xl !font-bold !text-gray-900 !mb-4 !pr-12 !leading-tight">
                                                        {'Project Stats'}
                                                    </h1>
                                                </div>

                                                {/* Scrollable content */}
                                                <div className="!p-8 !flex !flex-col !gap-6">
                                                    <div className="!w-full !h-[300px] sm:h-[250px] lg:h-[400px]">
                                                        <ChartLineDefault2 postId={selectedProject.id} />
                                                    </div>

                                                    {/* Stats Card */}
                                                    <div className="!bg-[#1a1a1a] !border !border-[#e2e5ea] !rounded-xl !mt-35 !p-6 !flex !flex-col !gap-4">
                                                        <h3 className="!text-lg !font-semibold !text-gray-900">Your Stats</h3>
                                                        <div className="!grid !grid-cols-2 !gap-4">
                                                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">{totalInteractions}</div>
                                                                <div className="!text-xs !text-[#6b7280]">Total Interactions</div>
                                                            </div>
                                                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">{postStats.views}</div>
                                                                <div className="!text-xs !text-[#6b7280]">Total Views</div>
                                                            </div>
                                                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">{postStats.clicks}</div>
                                                                <div className="!text-xs !text-[#6b7280]">Clicks</div>
                                                            </div>
                                                            <div className="!bg-[#f4f5f7] !border !border-[#e2e5ea] !rounded-lg !p-4 !text-center">
                                                                <div className="!text-2xl !font-bold !text-[#1f98f4] !mb-1">{postStats.bookmarks}</div>
                                                                <div className="!text-xs !text-[#6b7280]">Bookmarked</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="!mb-3 !mt-3 w-full z-50 flex justify-center py-4">
                                <Pagination
                                    pageCount={pageCount}
                                    currentPage={currentPage}
                                    onPageChange={(page: number) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="bg-gray-100 text-gray-900"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )

}
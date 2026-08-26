"use client";

// import { FaLightbulb } from "react-icons/fa";
import FlourishLogo from "@/components/ui/FlourishLogo";

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    message, 
    fullScreen = true 
}) => {
    const containerClasses = fullScreen
        ? "min-h-screen bg-white flex items-center justify-center"
        : "flex items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center">
                <div className="relative mb-4">
                    {/* Spinning circle around the icon */}
                    <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-b-2 border-[#1f98f4]"></div>
                    {/* Flourish logo in the center */}
                    <div className="flex items-center justify-center h-16 w-16">
                        {/* <FaLightbulb className="text-2xl text-[#1f98f4]" /> */}
                        <FlourishLogo className="text-2xl text-[#1f98f4]" />
                    </div>
                </div>
                {message && (
                    <p className="text-gray-900 text-sm font-medium animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;

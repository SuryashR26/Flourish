"use client";


import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/utils/cookies';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profileurl: string;
    is_verified: boolean | null;
    is_admin: boolean | null;
    age: number | null;
    personal_preferences: string[] | null;
}

type UserContextType = {
    user: User | null;
    isLoggedIn: boolean;
    isInitialized: boolean;
    login: (email: string, password: string) => Promise<string | undefined>;
    signUp: (email: string, first_name: string, last_name: string, password: string, code: string) => Promise<string | undefined>;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const pathname = usePathname();
    const login = async (email: string, password: string) => {
        const result = await fetch('http://localhost:8080/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        if (!result.ok) {
            const error = await result.json(); // Return error message if login fails
            return error.message;
        }
        const data = await result.json();
        if (data && data.user) {
            setUser(data.user);
            setIsLoggedIn(true);
            setCookie('user', JSON.stringify(data.user)); // Store user in cookie for 7 days
        }
        return data.message;
    };

    const signUp = async (email: string, first_name: string, last_name: string, password: string, code: string) => {
        const result = await fetch('http://localhost:8080/signup', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, first_name, last_name, password, code }),
        });
        if (!result.ok) {
            const error = await result.json();
            return error.message; // Return error message if signup fails
        }

        const message = await result.json();
        if (message && message.success) {
            if (message.message === 'Verification code sent to your email!') {
                return;
            }
        }
        if (message && message.success) {
            if (message.message === 'Email verified successfully!') {
                return;
            }
        }
        console.log('Signup response:', message);
        if (message && message.user) {
            setUser(message.user);
            setIsLoggedIn(true);
            setCookie('user', JSON.stringify(message.user)); // Store user in cookie for 7 days
        }
        return message.message;
    };

    const logout = async () => {
        const result = await fetch('http://localhost:8080/logout', {
            method: 'POST',
            credentials: 'include',
        });
        if (!result.ok) {
            const error = await result.json();
            console.error('Logout failed:', error.message);
            return;
        }
        setUser(null);
        setIsLoggedIn(false);
        router.push('/login')
        setCookie('user', '', { maxAge: -1 });
    };
    // Check if user is already logged in from cookie
    useEffect(() => {
        const checkUserFromCookie = async () => {
            try {
                const userCookie = await getCookie('user');
                if (userCookie) {
                    const parsedUser = JSON.parse(userCookie);
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                    console.log(userCookie)
                }
                else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Error checking user cookie:', error);
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setIsInitialized(true);
            }

        };
        checkUserFromCookie();
    }, [pathname]);

    return (
        <UserContext.Provider value={{ user, isLoggedIn, isInitialized, login, signUp, logout, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}


"use server"

import { cookies } from "next/headers"

/**
 * Set a cookie with secure options
 */
export async function setCookie(
    name: string,
    value: string,
    options: {
        maxAge?: number
        expires?: Date
        path?: string
    } = {},
): Promise<void> {
    const cookieStore = await cookies()

    cookieStore.set(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: options.path || "/",
        maxAge: options.maxAge || 60 * 60 * 24 * 7, // 7 days
        ...(options.expires && { expires: options.expires }),
    })
}

/**
 * Get a cookie by name
 */
export async function getCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(name)
    return cookie?.value
}

/**
 * Delete a cookie by name
 */
export async function deleteCookie(name: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(name)
}
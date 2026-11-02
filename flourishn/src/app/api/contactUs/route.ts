import { NextRequest, NextResponse } from "next/server"
import { getMailer } from "@/lib/mailer"

export async function POST(req: NextRequest) {
    try {
        const { first_name, last_name, email, message } = await req.json()

        if (!first_name || !last_name || !email || !message) {
            return NextResponse.json(
                { success: false, message: "First name, last name, email, and message are required" },
                { status: 400 }
            )
        }

        const transporter = getMailer()
        await transporter.sendMail({
            from: `"Flourish Board" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `New contact form submission from ${first_name} ${last_name}`,
            html: `
                <h2>New Contact Us submission</h2>
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        })

        return NextResponse.json({
            success: true,
            message: "Your contact form has been submitted successfully. We will get back to you soon.",
        })
    } catch (error) {
        console.error("Error in /api/contactUs:", error)
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again later." },
            { status: 500 }
        )
    }
}

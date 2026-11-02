import { NextRequest, NextResponse } from "next/server"
import { getMailer } from "@/lib/mailer"

export async function POST(req: NextRequest) {
    try {
        const {
            title,
            content,
            email,
            phone,
            location_preference,
            location,
            difficulty,
            status,
            time_commitment,
            project_category,
            role_count,
            role_description,
            project_tags,
            skill_tags,
        } = await req.json()

        if (!title || !content || !email || !phone) {
            return NextResponse.json(
                { success: false, message: "Title, content, email, and phone are required" },
                { status: 400 }
            )
        }

        const transporter = getMailer()
        await transporter.sendMail({
            from: `"Flourish Board" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `New idea submission: ${title}`,
            html: `
                <h2>New idea submitted on Flourish Board</h2>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Idea:</strong> ${content}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Category:</strong> ${project_category || "-"}</p>
                <p><strong>Status:</strong> ${status || "-"}</p>
                <p><strong>Difficulty:</strong> ${difficulty || "-"}</p>
                <p><strong>Time commitment:</strong> ${time_commitment || "-"}</p>
                <p><strong>Location preference:</strong> ${location_preference || "-"} ${location ? `(${location})` : ""}</p>
                <p><strong>Roles needed:</strong> ${role_count ?? "-"}</p>
                <p><strong>Role descriptions:</strong> ${(role_description || []).filter(Boolean).join(", ") || "-"}</p>
                <p><strong>Project tags:</strong> ${(project_tags || []).filter(Boolean).join(", ") || "-"}</p>
                <p><strong>Skill tags:</strong> ${(skill_tags || []).filter(Boolean).join(", ") || "-"}</p>
            `,
        })

        return NextResponse.json({
            success: true,
            message: "Your idea has been submitted! Our team will reach out soon.",
        })
    } catch (error) {
        console.error("Error in /api/ideaSubmission:", error)
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again later." },
            { status: 500 }
        )
    }
}

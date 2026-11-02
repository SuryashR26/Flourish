import nodemailer from "nodemailer"

export function getMailer() {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
        // Forces IPv4 — the backend's original transporter config needed this
        // to avoid SMTP connection issues on some networks. Nodemailer's types
        // don't declare it, but it's a valid node net-connect option.
        family: 4,
    } as Parameters<typeof nodemailer.createTransport>[0])
}

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    family: 4 // force IPv4
});

const submitIdea = async (req, res) => {
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
        } = req.body;

        if (!title || !content || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, email, and phone are required',
            });
        }

        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (!webhookUrl) {
            console.error('GOOGLE_SHEETS_WEBHOOK_URL is not configured');
            return res.status(500).json({
                success: false,
                message: 'Idea submission is not configured yet. Please try again later.',
            });
        }

        const sheetRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
            }),
        });

        if (!sheetRes.ok) {
            const errorText = await sheetRes.text();
            console.error('Google Sheets webhook failed:', errorText);
            return res.status(502).json({
                success: false,
                message: 'Failed to record submission. Please try again later.',
            });
        }

        // Best-effort notification — the sheet row is already the source of
        // truth, so a failed email here shouldn't fail the whole submission.
        try {
            await transporter.sendMail({
                from: `"Flourish" <${process.env.GMAIL_USER}>`,
                to: process.env.GMAIL_USER,
                replyTo: email,
                subject: `New idea submission: ${title}`,
                html: `
                    <h2>We got a response!</h2>
                    <p>Someone just submitted an idea on Flourish.</p>
                    <p><strong>Title:</strong> ${title}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Idea:</strong> ${content}</p>
                    <p>Full details are in the Google Sheet.</p>
                `,
            });
        } catch (emailError) {
            console.error('Notification email failed (submission still recorded):', emailError);
        }

        return res.status(200).json({
            success: true,
            message: 'Your idea has been submitted! Our team will reach out soon.',
        });

    } catch (error) {
        console.error('Error in submitIdea:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};

module.exports = { submitIdea };

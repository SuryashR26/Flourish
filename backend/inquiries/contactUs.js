require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// Contact Us only sends an email — it never needed the database. Left here,
// commented out, in case inquiries need to be logged to a table again later.
// const pool = require('../sql/dB');

const htmlTemplate = `
  <h2> Inquiry ID: {{inquiryId}}</h2>
  <p> First Name: {{first_name}}</p>
  <p> Last Name: {{last_name}}</p>
  <p> Email: {{email}}</p>
  <p> Message: {{message}}</p>
  <p> Timestamp: {{timestamp}}</p>
`;

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


const contactUs = async (req, res) => {
    try {
        const { first_name, last_name, email, message } = req.body;
        console.log('Contact Us request received:', req.body);

        if (!first_name || !last_name || !email || !message) {
            return res.status(400).json({
                error: 'All fields are required: first_name, last_name, email, message',
            });
        }

        const emailLower = email.toLowerCase();

        // Previously logged to a `inquiries` table in Postgres/RDS and read the
        // id/timestamp back — commented out, not deleted, in case that comes back.
        // const result = await pool.query(
        //     'INSERT INTO inquiries (first_name, last_name, email, message) VALUES ($1, $2, $3, $4)',
        //     [first_name, last_name, emailLower, message]
        // );
        // const Id = await pool.query(
        //     'SELECT id FROM inquiries WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
        //     [emailLower]
        // )
        // const time = await pool.query(
        //     'SELECT created_at FROM inquiries WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
        //     [emailLower]
        // )
        // const inquiryId = Id.rows[0].id;
        // const timestamp = time.rows[0].created_at;

        const inquiryId = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        const mailOptions = {
            from: `"Flourish" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `Inquiry ID: ${inquiryId}`,
            replyTo: emailLower,
            html: htmlTemplate
                .replace('{{inquiryId}}', inquiryId)
                .replace('{{first_name}}', first_name)
                .replace('{{last_name}}', last_name)
                .replace('{{email}}', emailLower)
                .replace('{{message}}', message)
                .replace('{{timestamp}}', timestamp),
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! If you do not receive a response within 24 hours, please contact us again.',
        });

    } catch (error) {
        console.error('Error in contactUs:', error);

        // This was a Postgres unique-constraint error code, only relevant to the
        // now-removed DB insert above — kept in case that comes back.
        // if (error.code === '23505') {
        //     return res.status(409).json({
        //         success: false,
        //         message: 'Values do not meet the constraints of our system. Please try again later',
        //     });
        // }
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
};

module.exports = { contactUs };



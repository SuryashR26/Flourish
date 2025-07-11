const nodemailer = require('nodemailer');
const pool = require('../sql/dB');
const crypto = require('crypto');

const htmlTemplate = `
<h2> Inquiry ID: {{inquiryId}}</h2>
<p> First Name: {{first_name}}</p>
<p> Last Name: {{last_name}}</p>
<p> Email: {{email}}</p>
<p> Here is the link to reset your password: {{url}}</p>
<p> Timestamp: {{timestamp}}</p>
`;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'FlourishIdeaBoard@gmail.com',
        pass: 'itzd ikju gkpr mudb',
    },
});

const resetPass = async (req, res) => {
    try {
        const token = crypto.randomBytes(8).toString('hex');
        const baseUrl = 'https://localhost:3000/login';
        const urlWithToken = `${baseUrl}?token=${token}`;

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }
        emailLower = email.toLowerCase();
        const user = await pool.query(
            'SELECT id, first_name, last_name FROM users WHERE email = $1',
            [emailLower]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const resetRequest = await pool.query(
            'INSERT INTO reset_password_requests (user_id, reset_code, email) VALUES ($1, $2, $3)',
            [user.rows[0].id, token, emailLower]
        );

        const timestamp = await pool.query(
            'SELECT request_time FROM reset_password_requests WHERE user_id = $1 ORDER BY request_time DESC LIMIT 1',
            [user.rows[0].id]
        );

        const inquiryID = await pool.query(
            'SELECT id FROM reset_password_requests WHERE user_id = $1 ORDER BY request_time DESC LIMIT 1',
            [user.rows[0].id]
        );

        const inquiry = inquiryID.rows[0].id;
        const firstName = user.rows[0].first_name;
        const lastName = user.rows[0].last_name;
        const time = timestamp.rows[0].request_time;

        await transporter.sendMail({
            from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
            to: emailLower,
            subject: 'Reset Password Request for Flourish',
            html: htmlTemplate
                .replace('{{inquiryId}}', inquiry)
                .replace('{{first_name}}', firstName)
                .replace('{{last_name}}', lastName)
                .replace('{{email}}', emailLower)
                .replace('{{url}}', urlWithToken)
                .replace('{{timestamp}}', time),
        });


    } catch (error) {
        console.error('Error in fetching user:', error);
        return res.status(500).json({
            error: 'Internal server error. Please try again.'
        });
    }
}

module.exports = {
    resetPass
};
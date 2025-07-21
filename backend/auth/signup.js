const bcrypt = require('bcrypt');
const pool = require('../sql/dB');
const nodemailer = require('nodemailer');


const htmlTemplate = `
  <h2> Verification Code: {{placeholder}}</h2>
  <p> Please use this code to verify your email address, and please do not share it with anyone else!</p>
`;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'FlourishIdeaBoard@gmail.com',
        pass: 'itzd ikju gkpr mudb',
    },
});

const signup = async (req, res) => {
    const { email, first_name, last_name, password, code } = req.body;

    if (email && !first_name && !last_name && !password && !code) {
        try {
            const { email } = req.body;
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            if (!email) {
                return res.status(400).json({
                    error: 'Email is required'
                });
            }

            const existingUser = await pool.query(
                'SELECT first_name FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (existingUser.rows.length > 0 && existingUser.rows[0].first_name !== null) {
                return res.status(409).json({
                    error: 'Email already registered'
                });
            }



            const emailLower = email.toLowerCase();
            const new_user = await pool.query(
                'INSERT INTO users (email, code) VALUES ($1, $2) ON CONFLICT(email) DO UPDATE SET code = $2, created_at = NOW() ',
                [emailLower, verificationCode]
            )

            await transporter.sendMail({
                from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
                to: emailLower,
                subject: 'Your Verification Code for Flourish',
                html: htmlTemplate
                    .replace('{{placeholder}}', verificationCode),
            });

            return res.status(200).json({
                success: true,
                message: 'Verification code sent to your email!'
            });
        } catch (error) {
            console.error('Error in sending verification code:', error);
            return res.status(500).json({
                error: 'Internal server error. Please try again.'
            });
        }
    }
    if (email && code && !first_name && !last_name && !password) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({
                    error: 'Email and verification code are required'
                });
            }
            const emailLower = email.toLowerCase();
            if (code == 'Failed') {
                await pool.query(
                    'DELETE FROM users WHERE email = $1',
                    [emailLower]
                );
                return res.status(200).json({
                    success: true,
                    message: 'User deleted successfully!'
                });
            }
            const verified = await pool.query(
                `SELECT * FROM users WHERE email = $1 AND code = $2 AND created_at > NOW() - INTERVAL '1 minute'`,
                [emailLower, code]
            );
            if (verified.rows.length === 0) {

                return res.status(400).json({
                    error: 'Invalid verification code or expired verification code'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Email verified successfully!'
            });
        } catch (error) {
            console.error('Error in verifying email:', error);
            return res.status(500).json({
                error: 'Internal server error. Please try again.'
            });
        }
    }
    if (email && first_name && last_name && password) {
        try {
            console.log('Signup request received:', req.body);

            if (!email || !first_name || !last_name || !password) {
                return res.status(400).json({
                    error: 'All fields are required: email, first, last, password'
                });
            }
            const emailLower = email.toLowerCase();


            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await pool.query(
                'UPDATE users SET first_name = $2, last_name = $3, password = $4, code = null WHERE email = $1',
                [emailLower, first_name, last_name, hashedPassword]
            );

            return res.status(201).json({
                success: true,
                message: 'User successfully created!',
            });

        } catch (error) {
            console.log('Signup error:', error);

            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Email already registered'
                });
            }

            res.status(500).json({
                error: 'Internal server error. Please try again.'
            });
        }

    }
};


module.exports = {
    signup
};


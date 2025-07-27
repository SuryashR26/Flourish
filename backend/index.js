const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
const { getPresignedUrl } = require('./s3utils/getPresignedUrl')
const session = require('express-session');
const { checkAlreadyLoggedIn } = require('./auth/checkSession')
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));


// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Database connected successfully!',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.post('/signup', checkAlreadyLoggedIn, signup);

app.post('/login', checkAlreadyLoggedIn, login);

app.post('/contactUs', contactUs);

app.post('/forgotPassword', resetPass);

app.get('/check-session', checkAlreadyLoggedIn)

/*(app.post('/photo-url', async (req, res) => ) {

}*/

//

app.post('/updateProfile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { filename, filetype } = req.body;

    try {
        const { url: new_url, key: new_key } = await getPresignedUrl(userId, filename, filetype);

        const updates = {
            profileurl: new_url
        };

        const keys = Object.keys(updates);
        const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
        const values = Object.values(updates);

        await pool.query(
            `UPDATE users SET ${setClauses} WHERE id = $${keys.length + 1}`,
            [...values, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            new_url,
            new_key
        });
    } catch (err) {
        console.error('Failed to update profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// app.get('/profile-photo', getProfilePhoto)


app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});
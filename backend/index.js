const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
const { getPresignedUrl } = require('./auth/getPresignedUrl')
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

app.post('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { type } = req.body;

    switch (type) {
        case 'uploadProfilePhoto':
            return getPresignedUrl(req, res);

        // Add more actions here
        // case 'someOtherAction':
        //     return someOtherFunction(req, res);

        default:
            return res.status(400).json({ error: 'Unknown dashboard action type' });
    }
});

// app.get('/profile-photo', getProfilePhoto)


app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});
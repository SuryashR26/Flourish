const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
const { updateProfile } = require('./profileChanges/updateProfile');
const { logout } = require('./auth/logout');
const { search } = require('./unfilteredPosts/search');
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
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

app.post('/signup', signup);

app.post('/login', login);

app.post('/contactUs', contactUs);

app.post('/forgotPassword', resetPass);

// app.post('/post', post)

app.get('/check-session', checkAlreadyLoggedIn)

app.post('/updateProfile', updateProfile);

app.post('/logout', logout);

app.get('/search', search)

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});
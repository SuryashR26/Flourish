const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
const { updateProfile } = require('./profileChanges/updateProfile');
const { updateSettings, getSettings } = require('./profileChanges/settings');
const { updatePassword } = require('./profileChanges/updatePassword');

const { logout } = require('./auth/logout');
const { search } = require('./post/search');
const { getBookmarkedPosts, getUserPosts, getRecommendedProjects } = require('./profileView/getUserPosts')
const incompleteRegistration = require('./notifications/incompleteRegistration');
const inactiveUsers = require('./notifications/inactiveUser');
const additionalInfo = require('./profileChanges/additionalinfo')
const cron = require('node-cron');
const bookmarkPost = require('./post/bookmark');
const storeViewProject = require('./post/storeView');
const { createPost, cleanupFailedPost } = require('./post/post');
const { sendMessage, getConversations, getMessages, markAsRead, getCurrentUser, searchUsers } = require('./messages/messages');
const session = require('express-session');
const { checkAlreadyLoggedIn } = require('./auth/checkSession')
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['*', 'Authorization'],
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
        httpOnly: false, // Allow frontend to access cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax', // Allow cross-origin requests
        domain: 'localhost', // Ensure cookie works on localhost,
    },
    name: 'sessionId', // Custom session name
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

// runs it at 9 am every day at the server time zone
cron.schedule('0 9 * * *', async () => {
    console.log('Running daily incomplete registration email task...');
    await incompleteRegistration();
});


// Schedule the task to run at midnight every 3 days (days divisible by 3)
cron.schedule('0 0 */3 * *', async () => {
    console.log('Running incomplete registration email task every 3 days...');
    try {
        await inactiveUsers();
        console.log('Task completed successfully.');
    } catch (error) {
        console.error('Error running task:', error);
    }
});

cron.schedule

app.post('/signup', signup);

app.post('/login', login);

app.post('/contactUs', contactUs);

app.post('/forgotPassword', resetPass);

// app.post('/post', post)

app.get('/check-session', checkAlreadyLoggedIn)

app.post('/posts', createPost);

app.post('/posts/cleanup', cleanupFailedPost);

// Message routes
app.post('/messages', sendMessage);

app.get('/conversations', getConversations);

app.get('/messages/:conversationId', getMessages);

app.put('/messages/read', markAsRead);

app.get('/user/current', getCurrentUser);

// User search for new conversations
app.get('/users/search', searchUsers);

app.post('/updateProfile', updateProfile);

// Settings routes
app.get('/settings', getSettings);
app.put('/settings', updateSettings);

// Password update route
app.put('/update-password', updatePassword);

app.post('/logout', logout);

app.get('/search', search)

app.post('/bookmark', bookmarkPost);

app.post('/storeView', storeViewProject);

app.post('/additionalInfo', additionalInfo)

app.get('/bookmarkedPosts', getBookmarkedPosts)

app.get('/getUserPosts', getUserPosts)

app.get('/getRecommendedProjects', getRecommendedProjects)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
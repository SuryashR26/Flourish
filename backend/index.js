const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
// AWS S3 is no longer used anywhere in the app — disabled, not deleted.
// const { updateProfile } = require('./profileChanges/updateProfile');
const { updateSettings, getSettings } = require('./profileChanges/settings');
const { updatePassword } = require('./profileChanges/updatePassword');
const { skillsDirectory } = require('./directories/skillsDirectories')

const { logout } = require('./auth/logout');
const { search } = require('./post/search');
const { getNotifications, getViews, getBookmarks, getClicks, getTotalPostBookmarks, getTotalPostClicks, getTotalPostViews, markAsReadNotifications, getIndividualPostBookmarks, getIndiviudalPostClicks, getIndividualPostViews } = require('./notifications/getNotifications')
const { getBookmarkedPosts, getUserPosts, getRecommendedProjects } = require('./profileView/getUserPosts')
const { weeklyDigest } = require('./notifications/weeklyDigest')
const incompleteRegistration = require('./notifications/incompleteRegistration');
const inactiveUsers = require('./notifications/inactiveUser');
const additionalInfo = require('./profileChanges/additionalinfo')
const cron = require('node-cron');
const bookmarkPost = require('./post/bookmark');
const storeViewProject = require('./post/storeView');
// Old DB+S3-backed post creation flow — superseded by /ideaSubmission (Google Sheets), disabled not deleted.
// const { createPost, cleanupFailedPost } = require('./post/post');
const { submitIdea } = require('./post/ideaSubmission');
const { sendMessage, getConversations, getMessages, markAsRead, getCurrentUser, searchUsers } = require('./messages/messages');
const session = require('express-session');
const { checkAlreadyLoggedIn } = require('./auth/checkSession')
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://flourishideas.com', 'http://flourishideas.com'],
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

// 2 pm every Sunday
cron.schedule('0 14 * * 0', async () => {
    console.log('Running Inactive Users Job...');
    await inactiveUsers();
});

// 6 pm every Sunday
cron.schedule('0 18 * * 0', async () => {
    console.log('Running Weekly Digest Job...');
    await weeklyDigest();
});

// runs it at 9 am every day at the server time zone
cron.schedule('0 9 * * *', async () => {
    console.log('Running daily incomplete registration k...');
    await incompleteRegistration();
});

app.post('/signup', signup);

app.post('/login', login);

app.post('/contactUs', contactUs);

app.post('/forgotPassword', resetPass);

// app.post('/post', post)

app.get('/check-session', checkAlreadyLoggedIn)

// app.post('/posts', createPost);

// app.post('/posts/cleanup', cleanupFailedPost);

// No auth required — anyone can submit an idea, it's recorded to a Google Sheet for the team to review.
app.post('/ideaSubmission', submitIdea);

// Message routes
app.post('/messages', sendMessage);

app.get('/conversations', getConversations);

app.get('/messages/:conversationId', getMessages);

app.put('/messages/read', markAsRead);

app.get('/user/current', getCurrentUser);

// User search for new conversations
app.get('/users/search', searchUsers);

// app.post('/updateProfile', updateProfile);

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

app.get('/getIndividualPostClicks', getIndiviudalPostClicks)

app.get('/getIndividualPostBookmarks', getIndividualPostBookmarks)

app.get('/getIndividualPostViews', getIndividualPostViews)

app.get('/getTotalPostBookmarks', getTotalPostBookmarks)

app.get('/getTotalPostClicks', getTotalPostClicks)

app.get('/getTotalPostViews', getTotalPostViews)

app.get('/getOverallViews', getViews)

app.get('/getOverallClicks', getClicks)

app.get('/getOverallBookmarks', getBookmarks)

app.get('/getNotifications', getNotifications)

app.post('/markNotifications', markAsReadNotifications)

app.get('/skillDirectory', skillsDirectory)


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
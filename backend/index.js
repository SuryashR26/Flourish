const express = require('express');
const pool = require('./sql/dB');
const { signup } = require('./auth/signup');
const { login } = require('./auth/login');
const { contactUs } = require('./inquiries/contactUs');
const { resetPass } = require('./inquiries/resetPass');
const { getPresignedUrl } = require('./auth/getPresignedUrl')
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

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

app.post('/dashboard', async (req, res) => {
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

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});
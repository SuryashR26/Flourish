const pool = require('../sql/optimized-dB');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request received:', req.body);

        const emailLower = email.toLowerCase();
        const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
        const exisitingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [emailLower]
        )
        if (exisitingUser.rows.length === 0) {
            const result1 = await pool.query(
                'INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, FALSE, $2)',
                [emailLower, clientIP]
            )
            return res.status(404).json({
                success: false,
                message: 'User not found. Please sign up first.'
            });
        }

        const passwordMatch = await bcrypt.compare(password, exisitingUser.rows[0].password);
        if (!passwordMatch) {
            const result3 = await pool.query(
                'INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, FALSE, $2)',
                [emailLower, clientIP]
            )
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Please try again.'
            });
        }

        const user_id = exisitingUser.rows[0].id;

        const result2 = await pool.query(
            'INSERT INTO login_attempts (email, success, user_id, ip_address ) VALUES ($1, TRUE, $2, $3)',
            [emailLower, user_id, clientIP]
        )

        req.session.userId = user_id; // sets the session user ID to the user ID of the person

        console.log('Session after login:', req.session);

        const user = {
            id: user_id,
            first_name: exisitingUser.rows[0].first_name,
            last_name: exisitingUser.rows[0].last_name,
            email: exisitingUser.rows[0].email,
            profileurl: exisitingUser.rows[0].profileurl,
            is_verified: exisitingUser.rows[0].is_verified,
            is_admin: exisitingUser.rows[0].is_admin,
            age: exisitingUser.rows[0].age,
            personal_preferences: exisitingUser.rows[0].personal_preferences
        };

        return res.status(201).json({
            success: true,
            user: user,
            message: 'Login successful!'
        });

    } catch (error) {
        console.log('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again.'
        });

    }
}

module.exports = {
    login
};
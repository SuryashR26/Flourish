const pool = require('../sql/dB');
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
                error: 'User not found'
            });
        }

        const passwordMatch = await bcrypt.compare(password, exisitingUser.rows[0].password);
        if (!passwordMatch) {
            const result3 = await pool.query(
                'INSERT INTO login_attempts (email, success, ip_address) VALUES ($1, FALSE, $2)',
                [emailLower, clientIP]
            )
            return res.status(401).json({
                error: 'Invalid password'
            });
        }

        const user_id = exisitingUser.rows[0].id;

        const result2 = await pool.query(
            'INSERT INTO login_attempts (email, success, user_id, ip_address ) VALUES ($1, TRUE, $2, $3)',
            [emailLower, user_id, clientIP]
        )

        return res.status(201).json({
            success: true,
            message: 'User successfully Logged In!',
        });

    } catch (error) {
        console.log('Login error:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Email not registered '
            });
        }

        return res.status(500).json({
            error: 'Internal server error. Please try again.'
        });

    }
}

module.exports = {
    login
};
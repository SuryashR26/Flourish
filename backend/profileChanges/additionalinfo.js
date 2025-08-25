const pool = require('../sql/dB.js');

const additionalInfo = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const user_id = req.session.userId;
    const { birthday, phoneNumber, interest, displayName } = req.body;

    if (!birthday || !interest) {
        return res.status(400).json({
            success: false,
            message: 'Birthday and Interests are required'
        });
    }

    try {
        if (phoneNumber && displayName) {
            await pool.query(
                `UPDATE users SET birthday = $2, phone_number = $3, personal_preferences = $4, display_name = $5, code = null WHERE id = $1`,
                [user_id, birthday, phoneNumber, interest, displayName]
            );
        } else if (displayName) {
            await pool.query(
                `UPDATE users SET birthday = $2, personal_preferences = $3, display_name = $4 code = null WHERE id = $1`,
                [user_id, birthday, interest, displayName]
            );
        } else if (phoneNumber) {
            await pool.query(
                `UPDATE users SET birthday = $2, personal_preferences = $3, phone_number = $4 code = null WHERE id = $1`,
                [user_id, birthday, interest, phoneNumber]
            );
        } else {
            await pool.query(
                `UPDATE users SET birthday = $2, personal_preferences = $3, code = null WHERE id = $1`,
                [user_id, birthday, interest]
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Signup successful! Welcome to Flourish!'
        });
    } catch (error) {
        console.error('Error updating user values', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

module.exports = additionalInfo;
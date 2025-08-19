const pool = require('../sql/dB');
const bcrypt = require('bcrypt');

const updatePassword = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            success: false,
            error: 'Not Authenticated' 
        });
    }

    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: current password, new password, and confirm password'
            });
        }

        // Validate new password requirements (same as signup)
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        // Get current user data
        const userResult = await pool.query(
            'SELECT password, email FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Verify current password
        const currentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!currentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check if new password is different from current password
        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Hash new password with same salt rounds as signup
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        const updateResult = await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedNewPassword, userId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update password'
            });
        }

        // Log the password change for security purposes
        console.log(`Password changed for user ID: ${userId}, email: ${user.email}`);

        // Successful response
        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (err) {
        console.error('Failed to update password:', err);
        res.status(500).json({ 
            success: false,
            error: 'Internal Server Error' 
        });
    }
};

module.exports = { updatePassword };

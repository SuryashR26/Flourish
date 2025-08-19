const pool = require('../sql/dB');

// Update user settings
const updateSettings = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { 
        display_name, 
        bio, 
        areas_of_interest,
        profile_visibility,
        show_email_publicly
    } = req.body;

    try {
        // Build dynamic update query based on provided fields
        const updates = {};
        const fieldsToUpdate = [];

        if (display_name !== undefined) {
            updates.display_name = display_name;
            fieldsToUpdate.push('display_name');
        }

        if (bio !== undefined) {
            updates.bio = bio;
            fieldsToUpdate.push('bio');
        }

        if (areas_of_interest !== undefined) {
            // Handle areas_of_interest as an array
            updates.personal_preferences = Array.isArray(areas_of_interest) ? areas_of_interest : [areas_of_interest];
            fieldsToUpdate.push('personal_preferences');
        }

        if (profile_visibility !== undefined) {
            // Validate profile_visibility value
            if (!['public', 'private'].includes(profile_visibility)) {
                return res.status(400).json({
                    success: false,
                    message: 'Profile visibility must be either "public" or "private"'
                });
            }
            updates.profile_visibility = profile_visibility;
            fieldsToUpdate.push('profile_visibility');
        }

        if (show_email_publicly !== undefined) {
            updates.show_email_publicly = show_email_publicly;
            fieldsToUpdate.push('show_email_publicly');
        }

        // If no fields to update, return success
        if (fieldsToUpdate.length === 0) {
            return res.json({
                success: true,
                message: 'No changes to update'
            });
        }

        // Build the SET clause dynamically
        const setClauses = fieldsToUpdate.map((field, idx) => {
            if (field === 'personal_preferences') {
                return `${field} = $${idx + 1}`;
            }
            return `${field} = $${idx + 1}`;
        }).join(', ');

        const values = fieldsToUpdate.map(field => updates[field]);

        // Update the user record
        const result = await pool.query(
            `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $${fieldsToUpdate.length + 1}`,
            [...values, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            updated_fields: fieldsToUpdate
        });

    } catch (err) {
        console.error('Failed to update settings:', err);
        res.status(500).json({ 
            success: false,
            error: 'Internal Server Error' 
        });
    }
};

// Get current user settings
const getSettings = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;

    try {
        const result = await pool.query(
            `SELECT 
                email,
                first_name,
                last_name,
                display_name,
                bio,
                personal_preferences as areas_of_interest,
                profile_visibility,
                show_email_publicly
            FROM users 
            WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        // Create display name from first_name + last_name if display_name is not set
        const displayName = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();

        res.json({
            success: true,
            settings: {
                email: user.email,
                display_name: displayName,
                bio: user.bio || '',
                areas_of_interest: user.areas_of_interest || [],
                profile_visibility: user.profile_visibility || 'public',
                show_email_publicly: user.show_email_publicly || false
            }
        });

    } catch (err) {
        console.error('Failed to get settings:', err);
        res.status(500).json({ 
            success: false,
            error: 'Internal Server Error' 
        });
    }
};

module.exports = { updateSettings, getSettings };

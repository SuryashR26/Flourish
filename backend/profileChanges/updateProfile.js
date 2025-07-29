const pool = require('../sql/dB');
const { getPresignedUrl } = require('../s3utils/getPresignedUrl');


const updateProfile = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { filename, filetype } = req.body;

    try {
        const { url: new_url, key: new_key } = await getPresignedUrl(userId, filename, filetype);
        const encodedKey = encodeURIComponent(new_key).replace(/%2F/g, '/'); // encode key but keep slashes
        const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;

        const updates = {
            profileurl: publicUrl,
        };

        const keys = Object.keys(updates);
        const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
        const values = Object.values(updates);

        await pool.query(
            `UPDATE users SET ${setClauses} WHERE id = $${keys.length + 1}`,
            [...values, userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            new_url,
            new_key,
            publicUrl
        });
    } catch (err) {
        console.error('Failed to update profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = { updateProfile };
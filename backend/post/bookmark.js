const pool = require('../sql/dB');


const bookmarkPost = async (req, res) => {
    const postId = req.body.projectId;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }
    console.log('Request body:', req.body);
    if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
    }

    try {
        const res2 = await pool.query(
            'SELECT user_id FROM postdata where  user_id = $1 AND id = $2',
            [userId, postId]
        )
        if (res2.rows.length > 0) {
            return res.status(400).json({ message: 'Post Was Created by User' });
        }
        const existingBookmark = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND $2 = ANY(bookmarked_projects)',
            [userId, postId]
        );
        if (existingBookmark.rows.length > 0) {
            return res.status(400).json({ message: 'Post already bookmarked' });
        }
        await pool.query(
            'UPDATE users SET bookmarked_projects = array_append(bookmarked_projects, $1) WHERE id = $2;',
            [postId, userId]
        );

        res.json({ success: true, message: 'Post bookmarked' });
    } catch (error) {
        console.error('Error bookmarking post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = bookmarkPost;
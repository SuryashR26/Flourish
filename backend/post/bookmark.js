const pool = require('../sql/dB');


const bookmarkPost = async (req, res) => {
    const postId = req.body.projectId;
    const userId = req.session.userId;
    const post_title = req.body.post_title
    const user_image = req.body.user_image

    if (!userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }
    console.log('Request body:', req.body);
    if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
    }

    try {
        const res2 = await pool.query(
            'SELECT user_id FROM postdata WHERE id = $1',
            [postId]
        )

        if (res2.rows[0].user_id === userId) {
            return res.status(404).json({ message: 'Post was created by user' });
        }

        const recipient_id = res2.rows[0].user_id;
        const user_name = await pool.query(
            'SELECT first_name from users where id = $1',
            [userId]
        )
        const actorName = user_name.rows[0].first_name;

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

        await pool.query(
            `INSERT INTO notifications (event_type, actor_id, actor_name, recipient_id, target_id, post_title, user_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['bookmark', userId, actorName, recipient_id, postId, post_title, user_image]
        );

        res.json({ success: true, message: 'Post bookmarked' });
    } catch (error) {
        console.error('Error bookmarking post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = bookmarkPost;
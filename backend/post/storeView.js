const pool = require('../sql/dB');


const storeViewProject = async (req, res) => {
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

        const userPost = await pool.query(
            'SELECT user_id FROM postdata WHERE id = $1',
            [postId]
        );

        if (userPost.rows[0].user_id === userId) {
            return res.status(404).json({ message: 'Cannot view your own post' });
        }

        await pool.query(
            `INSERT INTO post_views (post_id, user_id)
             VALUES ($1, $2)`,
            [postId, userId]
        );


        res.json({ success: true, message: 'Post view stored' });
    } catch (error) {
        console.error('Error storing post view:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = storeViewProject;
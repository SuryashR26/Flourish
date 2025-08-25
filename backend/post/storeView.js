const pool = require('../sql/dB');


const storeViewProject = async (req, res) => {
    const postId = req.body.projectId;
    const userId = req.session.userId;
    const post_title = req.body.post_title;
    if (!userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }
    console.log('Request body:', req.body);
    if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
    }
    try {

        const userPost = await pool.query(
            'SELECT user_id, user_image FROM postdata WHERE id = $1',
            [postId]
        );

        const recipientId = userPost.rows[0].user_id;
        const reciepent_image = req.body.user_image
        const user_name = await pool.query(
            'SELECT first_name from users where id = $1',
            [userId]
        )
        const actorName = user_name.rows[0].first_name;

        if (userPost.rows[0].user_id === userId) {
            return res.status(405).json({ message: 'Cannot view your own post' });
        }

        await pool.query(
            `INSERT INTO notifications (event_type, actor_id, actor_name, recipient_id, target_id, user_image, post_title)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['click', userId, actorName, recipientId, postId, reciepent_image, post_title]
        );



        res.json({ success: true, message: 'Post view stored' });
    } catch (error) {
        console.error('Error storing post view:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = storeViewProject;
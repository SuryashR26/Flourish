const pool = require('../sql/dB');


const getUserPosts = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const userId = req.session.userId;
        const posts = await pool.query(
            `SELECT * FROM postData 
             WHERE user_id = $1 AND status = 'active' 
             ORDER BY created_at DESC`,
            [userId]
        );


        res.json(posts.rows)
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


const getBookmarkedPosts = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }
    try {
        const userId = req.session.userId;
        const { rows } = await pool.query(
            `SELECT bookmarked_projects FROM users
             WHERE id = $1 AND is_active = true 
             ORDER BY created_at DESC`,
            [userId]
        );


        const bookmarks = rows[0]?.bookmarked_projects || [];

        let bookmarkedPosts = [];
        if (bookmarks.length > 0) {
            const { rows: posts } = await pool.query(
                'SELECT * FROM postdata WHERE id = ANY($1)',
                [bookmarks]
            );
            bookmarkedPosts = posts;
        }


        res.json(bookmarkedPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getRecommendedProjects = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }
    try {

        const userId = req.session.userId;
        const conditions = [];
        const values = [];
        let baseQuery = 'SELECT * FROM postdata WHERE is_draft = false AND user_id != $1';
        values.push(userId);

        let index = values.length + 1;
        const { rows } = await pool.query(
            `SELECT personal_preferences FROM users
             WHERE id = $1 AND is_active = true
             `,
            [userId]
        );

        const interests = rows[0]?.personal_preferences || [];

        if (interests.length > 0) {
            const interestArray = Array.isArray(interests) ? interests : [interests];

            const interestCondition = `skill_tags && $${index}::text[]`;
            values.push(interestArray);
            index++;

            const tsQuery = interestArray
                .map(interest => interest.toLowerCase().split(/\s+/).join(' | '))
                .join(' | ');
            const fullTextCondition = `document_with_weights @@ to_tsquery('english', $${index})`;
            values.push(tsQuery);
            index++;

            const fuzzyCondition = `
                EXISTS (
                SELECT 1 FROM unnest(skill_tags) AS skill_tag
                WHERE skill_tag % ANY($${index})
                )
             `;
            values.push(interestArray.map(s => s.toLowerCase()));
            index++;

            conditions.push(`(${interestCondition} OR ${fullTextCondition} OR ${fuzzyCondition})`);
        }

        if (conditions.length > 0) {
            baseQuery += ` AND ` + conditions.join(' AND ');
        }

        baseQuery += ' ORDER BY created_at DESC LIMIT 20';
        console.log(baseQuery)
        const result = await pool.query(baseQuery, values);


        if (result.rows.length === 0) {
            result2 = await pool.query(
                `SELECT * FROM postdata
                 WHERE user_id != $1 AND is_draft = false
                 `,
                [userId]
            );
            return res.json(result2.rows)
        }

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }


}

module.exports = {
    getBookmarkedPosts, getUserPosts, getRecommendedProjects
};
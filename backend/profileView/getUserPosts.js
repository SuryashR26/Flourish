const pool = require('../sql/dB.js');


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
        const values = [userId]; // $1 reserved for userId
        let index = values.length + 1;

        // --- Fetch user interests ---
        const { rows } = await pool.query(
            `SELECT personal_preferences FROM users
             WHERE id = $1 AND is_active = true`,
            [userId]
        );

        const interests = rows[0]?.personal_preferences || [];
        const interestArray = Array.isArray(interests) ? interests : [interests];

        if (interestArray.length > 0) {
            // --- 1. Skill tags overlap ---
            const skillTagsCondition = `skill_tags && $${index}::text[]`;
            values.push(interestArray.map(s => s.toLowerCase())); // normalize to lowercase
            index++;

            // --- 2. Full-text search on document_with_weights ---
            const tsQuery = interestArray.join(' '); // join all interests into one string
            const fullTextCondition = `document_with_weights @@ plainto_tsquery('english', $${index})`;
            values.push(tsQuery);
            index++;

            // --- 3. Fuzzy trigram search ---
            const fuzzyWords = interestArray.flatMap(i => i.toLowerCase().split(/\s+/));
            const fuzzyCondition = `
                EXISTS (
                    SELECT 1 FROM unnest(skill_tags) AS skill_tag
                    WHERE skill_tag % ANY($${index})
                )
                OR
                EXISTS (
                    SELECT 1 FROM unnest(project_tags) AS project_tag
                    WHERE project_tag % ANY($${index})
                )
            `;
            values.push(fuzzyWords);
            index++;

            // Combine conditions with OR
            conditions.push(`(${skillTagsCondition} OR ${fullTextCondition} OR ${fuzzyCondition})`);
        }

        // --- Build main query ---
        let baseQuery = 'SELECT * FROM postdata WHERE is_draft = false AND user_id != $1';
        if (conditions.length > 0) {
            baseQuery += ` AND ` + conditions.join(' AND ');
        }
        baseQuery += ' ORDER BY created_at DESC LIMIT 20';

        console.log('Query:', baseQuery, 'Values:', values);

        // --- Execute query ---
        const result = await pool.query(baseQuery, values);

        // --- Fallback if no recommended posts ---
        if (result.rows.length === 0) {
            const result2 = await pool.query(
                `SELECT * FROM postdata
                 WHERE user_id != $1 AND is_draft = false`,
                [userId]
            );

            return res.json(result2.rows);
        }
        const shuffled = [...result.rows];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }



        res.json(shuffled);

    } catch (error) {
        console.error('Error fetching recommended projects:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};


module.exports = {
    getBookmarkedPosts, getUserPosts, getRecommendedProjects
};
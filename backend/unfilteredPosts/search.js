const pool = require('../sql/dB');

const search = async (req, res) => {
    // const { query } = req.query;

    /* if (!query || query.trim() === '') {
         return res.status(400).json({ error: 'Search query cannot be empty' });
     }*/

    try {
        // const searchQuery = `%${query}%`;
        const result = await pool.query(
            `SELECT * FROM postdata`,
            // [searchQuery]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No posts found' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { search };
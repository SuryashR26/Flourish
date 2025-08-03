const pool = require('../sql/dB');

const search = async (req, res) => {
    // const { query } = req.query;

    /* if (!query || query.trim() === '') {
         return res.status(400).json({ error: 'Search query cannot be empty' });
     }*/

    try {
        // const searchQuery = `%${query}%`
        //;

        const {
            remote,
            inPerson,
            location,
            radius,
            skills,
            tags,
            difficulty,
            time
        } = req.query;

        console.log('Search parameters:', {
            remote,
            inPerson,
            location,
            radius,
            skills,
            tags,
            difficulty,
            time
        });

        let index = 1;
        const conditions = [];
        const values = [];
        let baseQuery = 'SELECT * FROM postdata WHERE is_draft = false';
        const remoteBool = remote === 'true';
        const inPersonBool = inPerson === 'true';
        let location_preference = null;
        if (!remoteBool && inPersonBool) {
            location_preference = 'in-person';
        }
        if (remoteBool && !inPersonBool) {
            location_preference = 'remote';
        }

        if (location_preference) {
            conditions.push(`location_preference = $${index++}`);
            values.push(location_preference);
        }

        if (conditions.length > 0) {
            baseQuery += ` AND ` + conditions.join(' AND ');
        }
        console.log('Base query:', baseQuery);
        console.log('Values:', values);
        console.log('LocationPreference:', location_preference);
        console.log('Conditions:', conditions);
        const result = await pool.query(baseQuery, values);

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
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
            time,
            query,
            sortBy
        } = req.query;

        console.log('Search parameters:', {
            remote,
            inPerson,
            location,
            radius,
            skills,
            tags,
            difficulty,
            time,
            query,
            sortBy
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

        if (difficulty && Array.isArray(difficulty)) {
            const placeholders = difficulty.map((_, i) => `$${index + i}`).join(', ');

            conditions.push(`difficulty IN (${placeholders})`);

            values.push(...difficulty.map(d => d.toLowerCase()));

            index += difficulty.length;
        }

        if (difficulty && !Array.isArray(difficulty)) {
            conditions.push(`difficulty = $${index++}`);
            values.push(difficulty.toLowerCase());
        }


        /* if (time && Array.isArray(time)) {
             const placeholders = time.map((_, i) => `$${index + i}`).join(', ');
 
             conditions.push(`time_commitment IN (${placeholders})`);
 
             values.push(...time.map(d => d.toLowerCase()));
 
             index += time.length;
         }*/

        /*  if (time && !Array.isArray(time)) {
              conditions.push(`time_commitment = $${index++}`);
              values.push(time.toLowerCase());
          }*/
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];

            const skillCondition = `skill_tags && $${index}::text[]`;
            values.push(skillsArray);
            index++;

            const tsQuery = skillsArray
                .map(skill => skill.toLowerCase().split(/\s+/).join(' | '))
                .join(' | ');
            const fullTextCondition = `document_with_weights @@ to_tsquery('english', $${index})`;
            values.push(tsQuery);
            index++;

            const fuzzyPlaceholders = skillsArray.map((_, i) => `$${index + i}`).join(', ');
            values.push(...skillsArray.map(s => s.toLowerCase()));
            index += skillsArray.length;

            const fuzzyCondition = `
                  EXISTS (
                    SELECT 1 FROM unnest(skill_tags) AS skill_tag
                    WHERE skill_tag % ANY(ARRAY[${fuzzyPlaceholders}])
                  )
                `;

            conditions.push(`(${skillCondition} OR ${fullTextCondition} OR ${fuzzyCondition})`);
        }


        if (query && query.trim() !== '') {
            const searchTerm = query.trim().toLowerCase();
            const tsQuery = searchTerm
                .split(/\s+/)
                .map(token => token + ':*')
                .join(' & ');
            const fullTextCondition = `document_with_weights @@ to_tsquery('english', $${index})`;
            values.push(tsQuery);
            index++;

            const fuzzyPlaceholder = `$${index}`;
            values.push(searchTerm);
            index++;
            const fuzzyCondition = `
                  EXISTS (
                    SELECT 1 FROM unnest(skill_tags) AS skill_tag
                    WHERE skill_tag % ${fuzzyPlaceholder}
                  ) OR
                  EXISTS (
                    SELECT 1 FROM unnest(project_tags) AS project_tag
                    WHERE project_tag % ${fuzzyPlaceholder}
                  ) OR
                  title % ${fuzzyPlaceholder} OR
                  content % ${fuzzyPlaceholder}
                `;
            conditions.push(`(${fullTextCondition} OR ${fuzzyCondition})`);
        }


        if (conditions.length > 0) {
            baseQuery += ` AND ` + conditions.join(' AND ');
        }

        if (sortBy) {
            if (sortBy === 'newest') {
                baseQuery += ' ORDER BY created_at DESC';
            } else if (sortBy === 'oldest') {
                baseQuery += ' ORDER BY created_at ASC';
            }
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
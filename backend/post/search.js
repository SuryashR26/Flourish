const pool = require('../sql/dB');

const search = async (req, res) => {
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
        sortBy,
        interests
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
        sortBy,
        interests,
    });

    try {
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

        const interestArray = interests
            ? Array.isArray(interests)
                ? interests
                : [interests]
            : [];
        if (interestArray.length > 0) {

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
        if (time && Array.isArray(time)) {
            const placeholders = time.map((_, i) => `$${index + i}`).join(', ');

            conditions.push(`time_commitment IN (${placeholders})`);

            values.push(...time.map(d => d.toLowerCase()));

            index += time.length;
        }

        if (time && !Array.isArray(time)) {
            conditions.push(`time_commitment = $${index++}`);
            values.push(time.toLowerCase());
        }

        if (tags && Array.isArray(tags)) {
            const placeholders = tags.map((_, i) => `$${index + i}`).join(', ');

            conditions.push(`project_category IN (${placeholders})`);

            values.push(...tags.map(d => d.toLowerCase()));

            index += tags.length;
        }

        if (tags && !Array.isArray(tags)) {
            conditions.push(`project_category = $${index++}`);
            values.push(tags.toLowerCase());
        }

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

            const tokens = searchTerm
                .split(/\s+/)
                .filter(token => token.length > 0)
                .map(token => token.replace(/[':!&|]/g, ''));

            const tsQuery = tokens.map(token => `${token}:*`).join(' & ');

            values.push(tsQuery);
            const tsIndex = index++;

            values.push(searchTerm);
            const fuzzyIndex = index++;

            // Push tokens array separately for author name partial matches
            values.push(tokens.map(t => `%${t}%`)); // array of patterns
            const authorTokensIndex = index++;

            const fullTextCondition = `document_with_weights @@ to_tsquery('english', $${tsIndex})`;

            const fuzzyCondition = `
              EXISTS (
                SELECT 1 FROM unnest(skill_tags) AS skill_tag
                WHERE similarity(skill_tag, $${fuzzyIndex}) > 0.2
              )
              OR EXISTS (
                SELECT 1 FROM unnest(project_tags) AS project_tag
                WHERE similarity(project_tag, $${fuzzyIndex}) > 0.2
              )
              OR similarity(title, $${fuzzyIndex}) > 0.2
              OR similarity(content, $${fuzzyIndex}) > 0.2
              OR EXISTS (
                SELECT 1 FROM unnest($${authorTokensIndex}::text[]) AS token
                WHERE user_name ILIKE token
              )
            `;

            const rankExpression = `
              (
                -- Exact title match boost
                CASE
                  WHEN regexp_replace(lower(title), '\\s+', ' ', 'g') = regexp_replace(lower($${fuzzyIndex}), '\\s+', ' ', 'g') THEN 1000
                  WHEN lower(title) ILIKE '%' || $${fuzzyIndex} || '%' THEN 500
                  ELSE 0
                END
                -- Exact author name match (very high boost)
                + CASE
                    WHEN regexp_replace(lower(user_name), '\\s+', ' ', 'g') = regexp_replace(lower($${fuzzyIndex}), '\\s+', ' ', 'g') THEN 800
                    ELSE 0
                  END
                -- Partial author name token match (medium boost)
                + CASE
                    WHEN EXISTS (
                      SELECT 1 FROM unnest($${authorTokensIndex}::text[]) AS token
                      WHERE lower(user_name) ILIKE token
                    ) THEN 200
                    ELSE 0
                  END
                -- Full text search rank
                + ts_rank_cd(document_with_weights, to_tsquery('english', $${tsIndex})) * 100
                -- Max similarity score among fields
                + GREATEST(
                    COALESCE((SELECT MAX(similarity(skill_tag, $${fuzzyIndex})) FROM unnest(skill_tags) AS skill_tag), 0),
                    COALESCE((SELECT MAX(similarity(project_tag, $${fuzzyIndex})) FROM unnest(project_tags) AS project_tag), 0),
                    similarity(title, $${fuzzyIndex}),
                    similarity(content, $${fuzzyIndex}),
                    similarity(user_name, $${fuzzyIndex})
                  ) * 50
                -- Token presence in title boost
                + CASE WHEN (
                    SELECT bool_and(lower(title) ILIKE '%' || token || '%')
                    FROM unnest(string_to_array($${fuzzyIndex}, ' ')) AS token
                  ) THEN 20 ELSE 0 END
              ) AS score
            `;

            conditions.push(`(${fullTextCondition} OR ${fuzzyCondition})`);

            baseQuery = baseQuery.replace('SELECT *', `SELECT *, ${rankExpression}`);
        }


        if (conditions.length > 0) {
            baseQuery += ` AND ` + conditions.join(' AND ');
        }


        if (sortBy) {
            if (sortBy === 'newest') {
                baseQuery += ' ORDER BY created_at DESC';
            } else if (sortBy === 'oldest') {
                baseQuery += ' ORDER BY created_at ASC';
            } else if (sortBy === 'relevance') {
                if (query && query.trim() !== '') {
                    baseQuery += ' ORDER BY score DESC';
                } else {
                    baseQuery += ' ORDER BY created_at DESC';
                }
            }
        } else {
            if (query && query.trim() !== '') {
                baseQuery += ' ORDER BY score DESC';
            } else {
                baseQuery += ' ORDER BY created_at DESC';
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


        const actorId = req.session.userId || null;
        let actorName = 'Guest'
        if (actorId) {
            const user_name = await pool.query(
                'SELECT first_name from users where id = $1',
                [actorId]
            )
            actorName = user_name.rows[0]?.first_name || 'Guest';
        }


        let placeholders = [];
        let values2 = [];
        let paramIndex = 1; // track placeholder numbering

        for (const post of result.rows) {
            if (actorId === post.user_id) {
                continue;
            }

            placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);

            values2.push('view');        // event_type
            values2.push(actorId);       // actor_id
            values2.push(actorName);     // actor_name
            values2.push(post.user_id);  // recipient_id
            values2.push(post.id);       // target_id

            paramIndex += 5;
        }
        const query2 = `
            INSERT INTO notifications (event_type, actor_id, actor_name, recipient_id, target_id)
            VALUES ${placeholders.join(', ')}
        `;

        if (placeholders.length > 0 && baseQuery != 'SELECT * FROM postdata WHERE is_draft = false ORDER BY created_at DESC') {
            await pool.query(query2, values2);
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { search };

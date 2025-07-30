const pool = require('../sql/dB');
const { getPostImageUrl } = require('../s3utils/getPostImageUrl');

const createPost = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const {
        title,
        content,
        roleCount,
        roleDescription,
        projectTags,
        skillTags,
        locationPreference,
        location,
        difficulty,
        hasImage,
        filename,
        filetype,
        confirmDuplicate
    } = req.body;

    
    if (title && content && !confirmDuplicate) {
        try {
            const duplicateCheck = await pool.query(
                'SELECT id FROM postData WHERE user_id = $1 AND title = $2 AND content = $3 AND is_active = true',
                [userId, title, content]
            );

            if (duplicateCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    isDuplicate: true,
                    message: 'You have already posted similar content. Are you sure you want to post this again?'
                });
            }
        } catch (error) {
            console.error('Error checking duplicates:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later.'
            });
        }
    }

    
    if (title && content && roleDescription) {
        try {
            console.log('Post creation request received:', req.body);

            
            if (!title || !content || !roleDescription) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, content, and role description are required'
                });
            }

            
            const userInfo = await pool.query(
                'SELECT first_name, last_name, email, profileurl FROM users WHERE id = $1',
                [userId]
            );

            if (userInfo.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = userInfo.rows[0];
            const userName = `${user.first_name} ${user.last_name}`;

            
            const postResult = await pool.query(
                `INSERT INTO postData 
                (user_id, user_name, user_email, user_image, title, content, role_count, 
                 role_description, project_tags, skill_tags, status, location_preference, 
                 location, difficulty) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
                RETURNING id`,
                [
                    userId,
                    userName,
                    user.email,
                    user.profileurl,
                    title,
                    content,
                    roleCount || 1,
                    roleDescription,
                    projectTags || [],
                    skillTags || [],
                    'active',
                    locationPreference || 'remote',
                    location,
                    difficulty || 'beginner'
                ]
            );

            const postId = postResult.rows[0].id;

            console.log('Post created with ID:', postId);

        
            if (hasImage && filename && filetype) {
                try {
                    const { url: presignedUrl, key: imageKey } = await getPostImageUrl(
                        userId, 
                        postId, 
                        filename, 
                        filetype
                    );

                    
                    const baseImageUrl = presignedUrl.split('?')[0]; 
                    await pool.query(
                        'UPDATE postData SET image_url = $1 WHERE id = $2',
                        [baseImageUrl, postId]
                    );

                    return res.status(201).json({
                        success: true,
                        message: 'Post created successfully',
                        postId: postId,
                        uploadUrl: presignedUrl,
                        imageKey: imageKey
                    });

                } catch (imageError) {
                    console.error('Image URL generation error:', imageError);
                    return res.status(500).json({
                        success: false,
                        message: 'Post created but image upload failed. Please try again.',
                        postId: postId
                    });
                }
            } else {
                return res.status(201).json({
                    success: true,
                    message: 'Post created successfully',
                    postId: postId
                });
            }

        } catch (error) {
            console.error('Post creation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later.'
            });
        }
    }
};

const cleanupFailedPost = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const { postId } = req.body;
        const userId = req.session.userId;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Delete the post (only if it belongs to the user)
        const result = await pool.query(
            'DELETE FROM postData WHERE id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found or unauthorized'
            });
        }

        console.log('Post cleaned up successfully:', postId);

        return res.status(200).json({
            success: true,
            message: 'Post cleaned up successfully'
        });

    } catch (error) {
        console.error('Error cleaning up post:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

const getUserPosts = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const userId = req.session.userId;
        const posts = await pool.query(
            `SELECT * FROM postData 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            posts: posts.rows
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const { limit = 20, offset = 0, difficulty, location, tags } = req.query;
        
        let query = `SELECT * FROM postData WHERE is_active = true AND status = 'active'`;
        const params = [];
        let paramCount = 0;

        // Add filters
        if (difficulty) {
            paramCount++;
            query += ` AND difficulty = $${paramCount}`;
            params.push(difficulty);
        }

        if (location) {
            paramCount++;
            query += ` AND (location_preference = 'remote' OR location ILIKE $${paramCount})`;
            params.push(`%${location}%`);
        }

        if (tags) {
            paramCount++;
            query += ` AND (project_tags @> $${paramCount} OR skill_tags @> $${paramCount})`;
            params.push([tags]);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);

        const posts = await pool.query(query, params);

        res.json({
            success: true,
            posts: posts.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: posts.rows.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { createPost, getUserPosts, getAllPosts, cleanupFailedPost };
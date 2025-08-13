const pool = require('../sql/optimized-dB');
const { getPostImageUrl } = require('../s3utils/getPostImageUrl');

const createPost = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    let { is_draft } = req.body;
    is_draft = is_draft ?? false;
    const {
        title,
        content,
        role_count,
        role_description,
        project_tags,
        skill_tags,
        location_preference,
        location,
        difficulty,
        status,
        hasImage,
        filename,
        filetype,
        confirmDuplicate,
    } = req.body;


    if (title && content && !confirmDuplicate) {
        try {
            const duplicateCheck = await pool.query(
                `
                SELECT id, similarity(content, $1) AS sim_score
                FROM postData
                WHERE user_id = $2 
                  AND title = $3
                  AND status = 'active'
                  AND similarity(content, $1) > 0.6
                ORDER BY sim_score DESC
                `,
                [content, userId, title]
            );

            if (duplicateCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    isDuplicate: true,
                    message: 'You have already posted similar content. Are you sure you want to post again?'
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


    if (title && content && role_description) {
        try {
            console.log('Post creation request received:', req.body);


            if (!title || !content || !role_description) {
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
            const query = `
                INSERT INTO postData (
                         user_id,
                         user_name,
                         user_email,
                         user_image,
                         title,
                         content,
                         role_count,
                         role_description,
                         project_tags,
                         skill_tags,
                         status,
                         location_preference,
                         location,
                         difficulty,
                         is_draft
                    ) VALUES (
                         $1, $2, $3, $4, $5, $6,
                         $7, $8, $9, $10,
                         $11, $12, $13, $14, $15
                    ) RETURNING *;
                `;

            const values = [
                userId,
                userName,
                user.email,
                user.profileurl,
                title,
                content,
                role_count,
                JSON.stringify(role_description),
                project_tags,
                skill_tags,
                status,
                location_preference,
                location,
                difficulty,
                is_draft
            ];

            const result = await pool.query(query, values);


            const postId = result.rows[0]

            console.log('Post created with ID:', postId.id);


            if (hasImage && filename && filetype) {
                try {
                    const { url: presignedUrl, key: imageKey } = await getPostImageUrl(
                        userId,
                        postId.id,
                        filename,
                        filetype
                    );


                    const encodedKey = encodeURIComponent(imageKey).replace(/%2F/g, '/'); // encode key but keep slashes
                    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;
                    await pool.query(
                        'UPDATE postData SET photourl = $1 WHERE id = $2',
                        [publicUrl, postId.id]
                    );

                    return res.status(201).json({
                        success: true,
                        message: 'Post created successfully',
                        postId: postId.id,
                        uploadUrl: presignedUrl,
                        imageKey: imageKey
                    });

                } catch (imageError) {
                    console.error('Image URL generation error:', imageError);
                    return res.status(505).json({
                        success: false,
                        message: 'Post created but image upload failed. Please try again.',
                        postId: postId.id
                    });
                }
            } else {
                return res.status(201).json({
                    success: true,
                    message: 'Post created successfully',
                    postId: postId.id
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


module.exports = { createPost, getUserPosts, cleanupFailedPost };
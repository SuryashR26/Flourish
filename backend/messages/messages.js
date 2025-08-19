const pool = require('../sql/dB');

const sendMessage = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const senderId = req.session.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
        return res.status(400).json({
            success: false,
            message: 'Receiver ID and content are required'
        });
    }

    if (receiverId === senderId) {
        return res.status(400).json({
            success: false,
            message: 'Cannot send message to yourself'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if receiver exists
        const receiverCheck = await client.query(
            'SELECT id FROM users WHERE id = $1 AND is_active = true',
            [receiverId]
        );

        if (receiverCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Find or create conversation - FIXED: Added proper parentheses for OR condition
        let conversationId;
        const existingConversation = await client.query(
            `SELECT id FROM conversations 
             WHERE ((participant1_id = $1 AND participant2_id = $2) 
             OR (participant1_id = $2 AND participant2_id = $1))
             AND is_active = true`,
            [senderId, receiverId]
        );

        if (existingConversation.rows.length > 0) {
            conversationId = existingConversation.rows[0].id;

            // Update conversation timestamp
            await client.query(
                'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1',
                [conversationId]
            );
        } else {
            // Create new conversation
            const newConversation = await client.query(
                `INSERT INTO conversations (participant1_id, participant2_id) 
                 VALUES ($1, $2) RETURNING id`,
                [senderId, receiverId]
            );
            conversationId = newConversation.rows[0].id;
        }

        // Insert message
        const messageResult = await client.query(
            `INSERT INTO messages (conversation_id, sender_id, content) 
             VALUES ($1, $2, $3) RETURNING id, created_at`,
            [conversationId, senderId, content]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            messageId: messageResult.rows[0].id,
            conversationId: conversationId,
            timestamp: messageResult.rows[0].created_at
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Send message error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    } finally {
        client.release();
    }
};

// 🚀 OPTIMIZED: Single query to get all conversation data (eliminates N+1 problem)
const getConversations = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;

    try {
        const conversationsQuery = `
            WITH user_conversations AS (
                SELECT 
                    c.id,
                    c.last_message_at,
                    c.created_at,
                    CASE 
                        WHEN c.participant1_id = $1 THEN c.participant2_id
                        ELSE c.participant1_id
                    END as other_participant_id
                FROM conversations c
                WHERE (c.participant1_id = $1 OR c.participant2_id = $1) 
                AND c.is_active = true
            ),
            last_messages AS (
                SELECT DISTINCT ON (m.conversation_id)
                    m.conversation_id,
                    m.content,
                    m.created_at as message_time,
                    m.sender_id
                FROM messages m
                INNER JOIN user_conversations uc ON m.conversation_id = uc.id
                WHERE m.is_active = true 
                AND m.content != 'SYSTEM_CONVERSATION_CREATED'
                ORDER BY m.conversation_id, m.created_at DESC
            ),
            unread_counts AS (
                SELECT 
                    m.conversation_id,
                    COUNT(*) as unread_count
                FROM messages m
                INNER JOIN user_conversations uc ON m.conversation_id = uc.id
                WHERE m.sender_id != $1 
                AND m.is_read = false 
                AND m.is_active = true
                AND m.content != 'SYSTEM_CONVERSATION_CREATED'
                GROUP BY m.conversation_id
            )
            SELECT 
                uc.id,
                uc.last_message_at,
                uc.created_at,
                u.id as participant_id,
                u.first_name || ' ' || u.last_name as participant_name,
                u.profileurl as participant_image,
                COALESCE(lm.content, '') as last_message_content,
                COALESCE(lm.message_time, uc.created_at) as last_message_time,
                COALESCE(unr.unread_count, 0) as unread_count
            FROM user_conversations uc
            INNER JOIN users u ON u.id = uc.other_participant_id
            LEFT JOIN last_messages lm ON lm.conversation_id = uc.id
            LEFT JOIN unread_counts unr ON unr.conversation_id = uc.id
            WHERE u.is_active = true
            ORDER BY uc.last_message_at DESC`;

        const result = await pool.query(conversationsQuery, [userId]);

        return res.json({
            success: true,
            conversations: result.rows
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 🚀 OPTIMIZED: Enhanced messages retrieval with better pagination
const getMessages = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!conversationId) {
        return res.status(400).json({
            success: false,
            message: 'Conversation ID is required'
        });
    }

    try {
        // Verify user is part of the conversation
        const conversationCheck = await pool.query(
            `SELECT id FROM conversations 
             WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2) 
             AND is_active = true`,
            [conversationId, userId]
        );

        if (conversationCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this conversation'
            });
        }

        // Get messages with total count for better pagination
        const messagesQuery = `
            SELECT 
                m.id,
                m.content,
                m.is_read,
                m.created_at,
                u.first_name || ' ' || u.last_name as sender_name,
                u.id as sender_id,
                u.profileurl as sender_image,
                COUNT(*) OVER() as total_count
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = $1 AND m.is_active = true
             ORDER BY m.created_at ASC
             LIMIT $2 OFFSET $3`;

        const messages = await pool.query(messagesQuery, [conversationId, limit, offset]);

        const totalCount = messages.rows.length > 0 ? parseInt(messages.rows[0].total_count) : 0;

        return res.json({
            success: true,
            messages: messages.rows.map(row => ({
                id: row.id,
                content: row.content,
                is_read: row.is_read,
                created_at: row.created_at,
                sender_name: row.sender_name,
                sender_id: row.sender_id,
                sender_image: row.sender_image
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                totalCount: totalCount,
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });

    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 🚀 OPTIMIZED: Enhanced markAsRead with better response data
const markAsRead = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { conversationId } = req.body;

    if (!conversationId) {
        return res.status(400).json({
            success: false,
            message: 'Conversation ID is required'
        });
    }

    try {
        // Verify user is part of the conversation
        const conversationCheck = await pool.query(
            `SELECT id FROM conversations 
             WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2) 
             AND is_active = true`,
            [conversationId, userId]
        );

        if (conversationCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this conversation'
            });
        }

        // Mark all messages in conversation as read (except sender's own messages)
        // Returns the number of messages that were actually updated
        const updateResult = await pool.query(
            `UPDATE messages 
             SET is_read = true, updated_at = NOW()
             WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
             RETURNING id`,
            [conversationId, userId]
        );

        return res.json({
            success: true,
            message: 'Messages marked as read',
            messagesUpdated: updateResult.rows.length
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 🚀 NEW: Search users for starting new conversations
const searchUsers = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;
    const { query } = req.query; // Optional search query

    try {
        let searchQuery = `
            SELECT 
                u.id,
                u.first_name || ' ' || u.last_name as name,
                u.email,
                u.profileurl,
                u.first_name,
                u.last_name,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM conversations c 
                        WHERE (c.participant1_id = $1 AND c.participant2_id = u.id)
                           OR (c.participant1_id = u.id AND c.participant2_id = $1)
                        AND c.is_active = true
                    ) THEN true 
                    ELSE false 
                END as has_conversation
            FROM users u
            WHERE u.id != $1 
            AND u.is_active = true
        `;

        const values = [userId];

        // Add search filter if query provided
        if (query && query.trim()) {
            searchQuery += ` AND (
                u.first_name ILIKE $2 
                OR u.last_name ILIKE $2 
                OR (u.first_name || ' ' || u.last_name) ILIKE $2
                OR u.email ILIKE $2
            )`;
            values.push(`%${query.trim()}%`);
        }

        searchQuery += ` ORDER BY has_conversation DESC, u.first_name, u.last_name LIMIT 20`;

        const result = await pool.query(searchQuery, values);

        return res.json({
            success: true,
            users: result.rows
        });

    } catch (error) {
        console.error('Search users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 🚀 OPTIMIZED: Cached user data retrieval
const getCurrentUser = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const user = await pool.query(
            'SELECT id, first_name, last_name, email, profileurl FROM users WHERE id = $1 AND is_active = true',
            [req.session.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        return res.json({
            success: true,
            user: user.rows[0]
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { sendMessage, getConversations, getMessages, markAsRead, getCurrentUser, searchUsers }; 
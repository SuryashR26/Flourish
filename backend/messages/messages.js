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

    try {
        // Check if receiver exists
        const receiverCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND is_active = true',
            [receiverId]
        );

        if (receiverCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Find or create conversation
        let conversationId;
        const existingConversation = await pool.query(
            `SELECT id FROM conversations 
             WHERE (participant1_id = $1 AND participant2_id = $2) 
             OR (participant1_id = $2 AND participant2_id = $1)
             AND is_active = true`,
            [senderId, receiverId]
        );

        if (existingConversation.rows.length > 0) {
            conversationId = existingConversation.rows[0].id;
            
            // Update conversation timestamp
            await pool.query(
                'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1',
                [conversationId]
            );
        } else {
            // Create new conversation
            const newConversation = await pool.query(
                `INSERT INTO conversations (participant1_id, participant2_id) 
                 VALUES ($1, $2) RETURNING id`,
                [senderId, receiverId]
            );
            conversationId = newConversation.rows[0].id;
        }

        // Insert message
        const messageResult = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content) 
             VALUES ($1, $2, $3) RETURNING id, created_at`,
            [conversationId, senderId, content]
        );

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            messageId: messageResult.rows[0].id,
            conversationId: conversationId,
            timestamp: messageResult.rows[0].created_at
        });

    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

const getConversations = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    const userId = req.session.userId;

    try {
        // Get conversations with participant info
        const conversations = await pool.query(
            `SELECT 
                c.id,
                c.last_message_at,
                c.created_at,
                CASE 
                    WHEN c.participant1_id = $1 THEN u2.first_name || ' ' || u2.last_name
                    ELSE u1.first_name || ' ' || u1.last_name
                END as participant_name,
                CASE 
                    WHEN c.participant1_id = $1 THEN u2.id
                    ELSE u1.id
                END as participant_id,
                CASE 
                    WHEN c.participant1_id = $1 THEN u2.profileurl
                    ELSE u1.profileurl
                END as participant_image
             FROM conversations c
             JOIN users u1 ON c.participant1_id = u1.id
             JOIN users u2 ON c.participant2_id = u2.id
             WHERE (c.participant1_id = $1 OR c.participant2_id = $1) 
             AND c.is_active = true
             ORDER BY c.last_message_at DESC`,
            [userId]
        );

        // Get last message and unread count for each conversation
        const conversationsWithData = await Promise.all(
            conversations.rows.map(async (conv) => {
                // Get last message
                const lastMessage = await pool.query(
                    `SELECT content, created_at 
                     FROM messages 
                     WHERE conversation_id = $1 AND is_active = true 
                     ORDER BY created_at DESC 
                     LIMIT 1`,
                    [conv.id]
                );

                // Get unread count
                const unreadCount = await pool.query(
                    `SELECT COUNT(*) as count 
                     FROM messages 
                     WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false AND is_active = true`,
                    [conv.id, userId]
                );

                return {
                    ...conv,
                    last_message_content: lastMessage.rows[0]?.content || '',
                    last_message_time: lastMessage.rows[0]?.created_at || conv.created_at,
                    unread_count: parseInt(unreadCount.rows[0].count)
                };
            })
        );

        return res.json({
            success: true,
            conversations: conversationsWithData
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

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

        // Get messages
        const messages = await pool.query(
            `SELECT 
                m.id,
                m.content,
                m.is_read,
                m.created_at,
                u.first_name || ' ' || u.last_name as sender_name,
                u.id as sender_id,
                u.profileurl as sender_image
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = $1 AND m.is_active = true
             ORDER BY m.created_at ASC
             LIMIT $2 OFFSET $3`,
            [conversationId, limit, offset]
        );

        return res.json({
            success: true,
            messages: messages.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: messages.rows.length === parseInt(limit)
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
        await pool.query(
            `UPDATE messages 
             SET is_read = true, updated_at = NOW()
             WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
            [conversationId, userId]
        );

        return res.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getCurrentUser = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const user = await pool.query(
            'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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

module.exports = { sendMessage, getConversations, getMessages, markAsRead, getCurrentUser }; 
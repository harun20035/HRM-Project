const db = require('../db');

// Prikaz svih poruka za korisnika
const getUserMessages = async (req, res) => {
    const userId = req.user.userId;
    try {
        const messages = await db.query(`
            SELECT m.*, 
                   sender.first_name AS sender_first_name, 
                   sender.last_name AS sender_last_name,
                   recipient.first_name AS recipient_first_name,
                   recipient.last_name AS recipient_last_name
            FROM user_messages m
            LEFT JOIN users sender ON sender.user_id = m.sender_id
            LEFT JOIN users recipient ON recipient.user_id = m.recipient_id
            WHERE m.sender_id = $1 OR m.recipient_id = $1
            ORDER BY m.created_at ASC
        `, [userId]);

        res.render('pages/chat', {
            messages: messages.rows,
            user: req.user
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages');
    }
};

// Slanje nove poruke
const sendMessage = async (req, res) => {
    const userId = req.user.userId; // ID korisnika koji šalje poruku
    const { recipientId, text } = req.body; // ID primaoca i tekst poruke

    if (!text) {
        return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    try {
        const result = await db.query(`
            INSERT INTO user_messages (user_id, recipient_id, sender_id, text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [userId, recipientId, userId, text]);

        res.status(200).json({ message: 'Message sent successfully', data: result.rows[0] });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

const getChatPartners = async (req, res) => {
    const userId = req.user.userId;
    try {
        const partners = await db.query(`
            SELECT DISTINCT u.user_id, u.first_name, u.last_name 
            FROM users u
            JOIN user_messages m ON (m.user_id = u.user_id OR m.recipient_id = u.user_id)
            WHERE u.user_id != $1 AND (m.user_id = $1 OR m.recipient_id = $1)
        `, [userId]);
        res.json(partners.rows);
    } catch (err) {
        console.error('Error fetching chat partners:', err);
        res.status(500).send('Error fetching chat partners');
    }
};

const startNewConversation = async (req, res) => {
    const { recipientId } = req.body;
    const senderId = req.user.userId;

    try {
        // Insert a placeholder message to start the conversation
        await db.query(`
            INSERT INTO user_messages (user_id, recipient_id, text)
            VALUES ($1, $2, $3)
        `, [senderId, recipientId, 'Conversation started.']);

        res.status(200).json({ message: 'Conversation started successfully' });
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ message: 'Failed to start conversation', error: error.message });
    }
};

const getMessagesWithPartner = async (req, res) => {
    const userId = req.user.userId;
    const partnerId = req.params.userId;

    try {
        const messages = await db.query(`
            SELECT m.*, 
                   sender.first_name AS sender_first_name, 
                   sender.last_name AS sender_last_name,
                   recipient.first_name AS recipient_first_name,
                   recipient.last_name AS recipient_last_name
            FROM user_messages m
            LEFT JOIN users sender ON sender.user_id = m.sender_id
            LEFT JOIN users recipient ON recipient.user_id = m.recipient_id
            WHERE (m.sender_id = $1 AND m.recipient_id = $2)
               OR (m.sender_id = $2 AND m.recipient_id = $1)
            ORDER BY m.created_at ASC
        `, [userId, partnerId]);

        res.json(messages.rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: 'Error fetching messages' });
    }
};

const deleteChat = async (req, res) => {
    const userId = req.user.userId;
    const { partnerId } = req.params;

    try {
        await db.query(`
            DELETE FROM user_messages
            WHERE (sender_id = $1 AND recipient_id = $2)
               OR (sender_id = $2 AND recipient_id = $1)
        `, [userId, partnerId]);

        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};


module.exports = {
    getUserMessages,
    sendMessage,
    getChatPartners,
    startNewConversation,
    getMessagesWithPartner,
    deleteChat
};

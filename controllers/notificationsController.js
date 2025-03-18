const db = require('../db');

// Dohvaćanje notifikacija za korisnika
const getNotifications = async (req, res) => {
    const userId = req.user.userId;

    try {
        const manualResult = await db.query(`
            SELECT * FROM notifications WHERE recipient_id = $1 AND is_manual = TRUE ORDER BY created_at DESC
        `, [userId]);

        const automaticResult = await db.query(`
            SELECT * FROM notifications WHERE recipient_id = $1 AND is_manual = FALSE ORDER BY created_at DESC
        `, [userId]);

        res.render('pages/notifications', {
            manualNotifications: manualResult.rows,
            automaticNotifications: automaticResult.rows,
            role: req.user.role
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).send('Error fetching notifications');
    }
};

// Slanje manuelne notifikacije
const sendNotification = async (req, res) => {
    const { recipient_id, message, type } = req.body;
    const sender_id = req.user.userId; // Dohvatiti ID korisnika koji šalje notifikaciju

    console.log('Primljeni podaci:', { recipient_id, message, type, sender_id });

    const validTypes = ['invited for interview', 'rejected', 'accepted', 'applied for job'];

    if (!validTypes.includes(type)) {
        console.error('Invalid type:', type);
        return res.status(400).json({ error: 'Invalid notification type' });
    }

    try {
        const result = await db.query(`
            INSERT INTO notifications (recipient_id, message, type, is_manual, sender_id)
            VALUES ($1, $2, $3, TRUE, $4)
        `, [recipient_id, message, type, sender_id]);

        console.log('Query result:', result);
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (err) {
        console.error('Error inserting into database:', err);
        res.status(500).json({ error: 'Error sending manual notification' });
    }
};


// Dohvaćanje poslanih notifikacija
const getSentNotifications = async (req, res) => {
    const { role, userId } = req.user;

    try {
        let query = `
            SELECT n.*, u.first_name AS recipient_first_name, u.last_name AS recipient_last_name
            FROM notifications n
            JOIN users u ON n.recipient_id = u.user_id
            WHERE n.is_manual = TRUE
        `;

        const values = [];
        if (role === 'admin') {
            query += ` AND n.sender_id = $1`; // Dohvatiti notifikacije koje je poslao admin
            values.push(userId);
        }

        query += ` ORDER BY n.created_at DESC`;

        const result = await db.query(query, values);

        res.status(200).json({ sentNotifications: result.rows });
    } catch (err) {
        console.error('Error fetching sent notifications:', err);
        res.status(500).json({ error: 'Error fetching sent notifications' });
    }
};

module.exports = {
    getNotifications,
    sendNotification,
    getSentNotifications,
};


module.exports = {
    getNotifications,
    sendNotification,
    getSentNotifications
};
const db = require('../db');

// Prikazivanje komentara
const getComments = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        let comments;

        if (role === 'super_admin') {
            const result = await db.query(`
                SELECT c.*, u.first_name AS admin_first_name, u.last_name AS admin_last_name, 
                       a.job_id, a.created_at AS application_date, j.title AS job_title, 
                       app.first_name AS candidate_first_name, app.last_name AS candidate_last_name
                FROM comments c
                JOIN users u ON c.admin_id = u.user_id
                JOIN applications a ON c.application_id = a.application_id
                JOIN jobs j ON a.job_id = j.job_id
                JOIN users app ON a.user_id = app.user_id
                ORDER BY c.created_at DESC
            `);
            comments = result.rows;
        } else if (role === 'admin') {
            const result = await db.query(`
                SELECT c.*, u.first_name AS admin_first_name, u.last_name AS admin_last_name, 
                       a.job_id, a.created_at AS application_date, j.title AS job_title, 
                       app.first_name AS candidate_first_name, app.last_name AS candidate_last_name
                FROM comments c
                JOIN users u ON c.admin_id = u.user_id
                JOIN applications a ON c.application_id = a.application_id
                JOIN jobs j ON a.job_id = j.job_id
                JOIN users app ON a.user_id = app.user_id
                WHERE c.admin_id = $1
                ORDER BY c.created_at DESC
            `, [userId]);
            comments = result.rows;
        } else if (role === 'user') {
            const result = await db.query(`
                SELECT c.*, u.first_name AS admin_first_name, u.last_name AS admin_last_name, 
                       a.created_at AS application_date
                FROM comments c
                JOIN users u ON c.admin_id = u.user_id
                JOIN applications a ON c.application_id = a.application_id
                WHERE c.application_id IN (SELECT application_id FROM applications WHERE user_id = $1)
                ORDER BY c.created_at DESC
            `, [userId]);
            comments = result.rows;
        }
        
        res.render('pages/comments', { comments, role, user: req.user });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send('Error fetching comments');
    }
};


// Dodavanje komentara
const createComment = async (req, res) => {
    const { application_id, comment } = req.body;
    const admin_id = req.user.userId;

    try {
        await db.query(`
            INSERT INTO comments (application_id, admin_id, comment)
            VALUES ($1, $2, $3)
        `, [application_id, admin_id, comment]);

        res.status(201).json({ message: 'Comment added successfully' });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ error: 'Error adding comment' });
    }
};

// Brisanje komentara
const deleteComment = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(`DELETE FROM comments WHERE id = $1`, [id]);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Error deleting comment' });
    }
};

// Ažuriranje komentara
const updateComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    try {
        await db.query(`
            UPDATE comments SET comment = $1 WHERE id = $2
        `, [comment, id]);

        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ error: 'Error updating comment' });
    }
};

module.exports = {
    getComments,
    createComment,
    deleteComment,
    updateComment
};

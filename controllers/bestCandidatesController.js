const db = require('../db');

const getBestCandidates = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                u.user_id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                AVG(a.score) AS average_score
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.score IS NOT NULL
            GROUP BY u.user_id, u.first_name, u.last_name, u.email
            ORDER BY average_score DESC
        `);

        res.render('pages/bestCandidates', { candidates: result.rows });
    } catch (err) {
        console.error('Error fetching best candidates:', err);
        res.status(500).send('Error fetching best candidates');
    }
};

module.exports = {
    getBestCandidates,
};

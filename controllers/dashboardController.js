const express = require('express');
const pool = require('../db');
const router = express.Router();

// Zaštićena ruta za dashboard
const dashboard = (req, res) => {
    const userRole = req.user.role;

    // Provjera uloge korisnika i renderovanje odgovarajuće stranice
    if (userRole === 'super_admin') {
        return res.render('pages/dashboard', { user: req.user, role: 'super_admin' });
    } else if (userRole === 'admin') {
        return res.render('pages/dashboard', { user: req.user, role: 'admin' });
    } else if (userRole === 'user') {
        return res.render('pages/dashboard', { user: req.user, role: 'user' });
    }

    return res.status(403).json({ error: 'Access denied' });
};

const getStatistics = async (req, res) => {
    try {
        // SQL upiti za statistiku
        const userCountResult = await pool.query('SELECT COUNT(*) AS user_count FROM users');
        const userCount = userCountResult.rows[0].user_count;

        const jobCountResult = await pool.query('SELECT COUNT(*) AS job_count FROM jobs');
        const jobCount = jobCountResult.rows[0].job_count;

        const applicationCountResult = await pool.query('SELECT COUNT(*) AS application_count FROM applications');
        const applicationCount = applicationCountResult.rows[0].application_count;

        const averageScoreResult = await pool.query(`
            SELECT AVG(score) AS avg_score 
            FROM applications 
            WHERE score IS NOT NULL
        `);
        const avgCandidateScore = averageScoreResult.rows[0].avg_score
            ? parseFloat(averageScoreResult.rows[0].avg_score).toFixed(2)
            : 'N/A';

        const bestCandidateResult = await pool.query(`
            SELECT 
            u.user_id, 
            u.first_name, 
            u.last_name, 
            AVG(a.score) AS average_score
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.score IS NOT NULL
            GROUP BY u.user_id, u.first_name, u.last_name
            ORDER BY average_score DESC
            LIMIT 1;
        `);
        const bestCandidate = bestCandidateResult.rows[0];

        let avgScoreForBestCandidate = 'N/A';
        if (bestCandidate) {
            const avgScoreForBestCandidateResult = await pool.query(`
                SELECT AVG(a.score) AS avg_score 
                FROM applications a 
                WHERE a.user_id = $1 AND a.score IS NOT NULL
            `, [bestCandidate.user_id]);
            avgScoreForBestCandidate = avgScoreForBestCandidateResult.rows[0].avg_score
                ? parseFloat(avgScoreForBestCandidateResult.rows[0].avg_score).toFixed(2)
                : 'N/A';
        }

        const bestCandidateDisplay = bestCandidate
            ? {
                name: `${bestCandidate.first_name} ${bestCandidate.last_name}`,
                avgScore: avgScoreForBestCandidate,
            }
            : { name: 'No data available', avgScore: 'N/A' };

        // Slanje JSON odgovora
        res.json({
            usersCount: userCount,
            jobsCount: jobCount,
            applicationsCount: applicationCount,
            averageCandidateScore: avgCandidateScore,
            bestCandidate: bestCandidateDisplay.name,
            avgScoreForBestCandidate: bestCandidateDisplay.avgScore,
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics.' });
    }
};

module.exports = { dashboard, getStatistics };

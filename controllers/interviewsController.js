const db = require('../db');
const sendEmail = require('../config/mailer');

// Dohvatanje intervjua
const getInterviews = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        if (role === 'user') {
            // Dohvati intervjue za korisnika, uključujući status
            const result = await db.query(`
                SELECT i.id, i.date_time, i.location, i.status, 
                       j.title AS job_title, a.status AS application_status
                FROM interviews i
                JOIN applications a ON i.application_id = a.application_id
                JOIN jobs j ON a.job_id = j.job_id
                WHERE a.user_id = $1
                ORDER BY i.date_time ASC
            `, [userId]);
            
            res.render('pages/interviews', { interviews: result.rows, role });
        } else if (role === 'admin' || role === 'super_admin') {
            // Dohvati aplikacije sa statusom 'applied' ili 'reviewed'
            const result = await db.query(`
                SELECT a.application_id, j.title AS job_title, u.first_name AS candidate_first_name, 
                       u.last_name AS candidate_last_name, a.status
                FROM applications a
                JOIN jobs j ON a.job_id = j.job_id
                JOIN users u ON a.user_id = u.user_id
                WHERE a.status IN ('applied', 'reviewed')
                ORDER BY a.created_at ASC
            `);

            res.render('pages/interviews', { applications: result.rows, role });
        } else {
            res.status(403).send('Access denied');
        }
    } catch (err) {
        console.error('Error fetching interviews:', err);
        res.status(500).send('Error fetching interviews');
    }
};

// Zakazivanje intervjua
const scheduleInterview = async (req, res) => {
    const { application_id, date_time, location } = req.body;

    try {
        // Zakazivanje intervjua
        await db.query(`
            INSERT INTO interviews (application_id, date_time, location, created_by)
            VALUES ($1, $2, $3, $4)
        `, [application_id, date_time, location, req.user.userId]);

        // Ažuriranje statusa aplikacije na 'invited for interview'
        await db.query(`
            UPDATE applications
            SET status = 'invited_for_interview'
            WHERE application_id = $1
        `, [application_id]);

        // Slanje emaila
        const userResult = await db.query(`
            SELECT u.email, j.title
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            JOIN jobs j ON a.job_id = j.job_id
            WHERE a.application_id = $1
        `, [application_id]);

        const { email, title } = userResult.rows[0];
        const emailInfo = await sendEmail(
            email,
            'Interview Invitation',
            `You have been invited for an interview for the job: ${title}. The interview will take place on ${date_time} at ${location}.`
        );

        console.log('Email preview URL:', emailInfo.previewURL);
        res.status(201).json({ message: 'Interview scheduled successfully' });
    } catch (err) {
        console.error('Error scheduling interview:', err);
        res.status(500).json({ error: 'Error scheduling interview' });
    }
};

// Ažuriranje statusa aplikacije
const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    try {
        await db.query(`
            UPDATE applications SET status = $1 WHERE application_id = $2
        `, [status, applicationId]);

        res.status(200).json({ message: 'Application status updated successfully' });
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(500).json({ error: 'Error updating application status' });
    }
};

const confirmInterview = async (req, res) => {
    const { interviewId } = req.params;

    try {
        // Ažuriranje statusa intervjua na 'confirmed'
        await db.query(`
            UPDATE interviews
            SET status = 'confirmed'
            WHERE id = $1
        `, [interviewId]);

        res.status(200).json({ message: 'Interview confirmed successfully.' });
    } catch (err) {
        console.error('Error confirming interview:', err);
        res.status(500).json({ error: 'Error confirming interview.' });
    }
};


const declineInterview = async (req, res) => {
    const { interviewId } = req.params;

    try {
        // Ažuriranje statusa intervjua na 'declined'
        await db.query(`
            UPDATE interviews
            SET status = 'declined'
            WHERE id = $1
        `, [interviewId]);

        // Ažuriranje statusa aplikacije na 'applied'
        await db.query(`
            UPDATE applications
            SET status = 'applied'
            WHERE application_id = (SELECT application_id FROM interviews WHERE id = $1)
        `, [interviewId]);

        res.status(200).json({ message: 'Interview declined successfully.' });
    } catch (err) {
        console.error('Error declining interview:', err);
        res.status(500).json({ error: 'Error declining interview.' });
    }
};


module.exports = {
    getInterviews,
    scheduleInterview,
    updateApplicationStatus,
    confirmInterview,
    declineInterview
};
const db = require('../db');
const sendEmail = require('../config/mailer');

// Dohvatanje aplikacija prema statusima
const getApplicationsStatus = async (req, res) => {
    try {
        // Dohvaćanje aplikacija sa statusom 'invited_for_interview' i intervjuima u statusu 'pending'
        const invitedApplications = await db.query(`
            SELECT a.application_id, u.first_name, u.last_name, j.title AS job_title, a.status, i.status AS interview_status
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            JOIN jobs j ON a.job_id = j.job_id
            LEFT JOIN interviews i ON a.application_id = i.application_id
            WHERE a.status = 'invited_for_interview' AND i.status = 'confirmed'
        `);

        // Dohvaćanje aplikacija sa statusima 'accepted' ili 'rejected'
        const finalApplications = await db.query(`
            SELECT a.application_id, u.first_name, u.last_name, j.title AS job_title, a.status 
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            JOIN jobs j ON a.job_id = j.job_id
            WHERE a.status IN ('accepted', 'rejected')
        `);

        res.render('pages/applicationsStatus', {
            invitedApplications: invitedApplications.rows,
            finalApplications: finalApplications.rows,
        });
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).send('Error fetching applications');
    }
};

// Ažuriranje statusa aplikacija
const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    try {
        // Ažuriranje statusa aplikacije
        await db.query(`
            UPDATE applications SET status = $1 WHERE application_id = $2
        `, [status, applicationId]);

        // Dohvaćanje korisničkog emaila i informacije o poslu
        const userResult = await db.query(`
            SELECT u.email, j.title 
            FROM applications a
            JOIN users u ON a.user_id = u.user_id
            JOIN jobs j ON a.job_id = j.job_id
            WHERE a.application_id = $1
        `, [applicationId]);

        const { email, title } = userResult.rows[0];

        // Priprema sadržaja emaila
        let subject, text;
        if (status === 'accepted') {
            subject = `Application Accepted for ${title}`;
            text = `Congratulations! Your application for ${title} has been accepted.`;
        } else if (status === 'rejected') {
            subject = `Application Rejected for ${title}`;
            text = `We regret to inform you that your application for ${title} has been rejected.`;
        } else {
            subject = `Application Status Updated for ${title}`;
            text = `Your application for ${title} has been updated to status: ${status}.`;
        }

        // Slanje emaila
        const emailInfo = await sendEmail(email, subject, text);
        console.log('Email preview URL:', emailInfo.previewURL);

        res.status(200).json({ message: `Application status updated to ${status}` });
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(500).json({ error: 'Error updating application status' });
    }
};

module.exports = {
    getApplicationsStatus,
    updateApplicationStatus,
};

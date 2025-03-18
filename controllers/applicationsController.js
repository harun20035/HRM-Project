const db = require('../db');


// Prikaz prijava za korisnika
/*const getUserApplications = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT a.*, j.title, j.description 
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE a.user_id = $1`,
            [userId]
        );

        res.render('pages/applications', { applications: result.rows, role: req.user.role });
    } catch (err) {
        console.error('Error fetching user applications:', err);
        res.status(500).send('Error fetching user applications');
    }
};

// Prikaz prijava za određeni posao (admini)
const getJobApplications = async (req, res) => {
    const { jobId } = req.params;
    
    try {
        const result = await db.query(
            `SELECT a.*, u.first_name, u.last_name, u.email, u.experience, u.education, u.cv, 
            a.cover_letter, a.certificates, j.title 
            FROM applications a 
            JOIN users u ON a.user_id = u.user_id 
            JOIN jobs j ON a.job_id = j.job_id`,
            [jobId]
        );

        res.render('pages/jobApplications', { applications: result.rows });
    } catch (err) {
        console.error('Error fetching job applications:', err);
        res.status(500).send('Error fetching job applications');
    }
};*/

// Rangiranje kandidata
const rankCandidate = async (req, res) => {
    const { jobId } = req.params;
    const { applicationId, score } = req.body;

    try {
        await db.query(
            `UPDATE applications SET score = $1 WHERE application_id = $2 AND job_id = $3`,
            [score, applicationId, jobId]
        );

        res.status(200).json({ message: 'Candidate ranked successfully' });
    } catch (err) {
        console.error('Error ranking candidate:', err);
        res.status(500).json({ error: 'Error ranking candidate' });
    }
};

// Dodavanje komentara
const addComment = async (req, res) => {
    const { jobId } = req.params;
    const { applicationId, comment } = req.body;
    const adminId = req.user.userId;

    try {
        await db.query(
            `INSERT INTO comments (application_id, admin_id, comment) VALUES ($1, $2, $3)`,
            [applicationId, adminId, comment]
        );

        res.status(200).json({ message: 'Comment added successfully' });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ error: 'Error adding comment' });
    }
};

const getApplications = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        let applications;

        if (role === 'user') {
            // Dohvati prijave korisnika
            const result = await db.query(
                `SELECT a.application_id, a.job_id, a.status, a.created_at, j.title, j.description 
                 FROM applications a 
                 JOIN jobs j ON a.job_id = j.job_id 
                 WHERE a.user_id = $1`,
                [userId]
            );
            applications = result.rows;
        } else if (role === 'admin' || role === 'super_admin') {
            // Dohvati sve prijave za admina ili super_admina
            const query = `SELECT a.*, u.first_name, u.last_name, u.email, u.experience, u.education, u.cv, j.title 
               FROM applications a 
               JOIN users u ON a.user_id = u.user_id 
               JOIN jobs j ON a.job_id = j.job_id`;

            const result = await db.query(query);
            applications = result.rows;
        }

        // Sortiranje aplikacija tako da one sa statusom 'accepted' ili 'rejected' budu na dnu liste
        applications.sort((a, b) => {
            const statusA = (a.status === 'accepted' || a.status === 'rejected');
            const statusB = (b.status === 'accepted' || b.status === 'rejected');
            return statusA - statusB || new Date(a.created_at) - new Date(b.created_at);
        });

        //console.log("Applications for admin/super_admin:", applications);

        res.render('pages/applications', { applications, role });
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).send('Error fetching applications');
    }
};

module.exports = {
    //getUserApplications,
    //getJobApplications,
    rankCandidate,
    addComment,
    getApplications
};
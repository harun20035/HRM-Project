const db = require('../db');

// Dohvatanje svih poslova
const getAllJobs = async (req, res) => {
    try {
        const jobsResult = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
        const applicationsResult = await db.query(`
            SELECT job_id, status
            FROM applications
            WHERE user_id = $1
        `, [req.user.userId]);        

        const jobs = jobsResult.rows;
        const applications = applicationsResult.rows;
        
        res.render('pages/jobs', { jobs, applications, role: req.user.role });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).send('Error fetching jobs');
    }
};

// Kreiranje novog posla
const createJob = async (req, res) => {
    const { title, description, requirements, deadline, required_fields } = req.body;
    const createdBy = req.user.userId;

    try {
        const result = await db.query(
            `INSERT INTO jobs (title, description, requirements, deadline, created_by, status, required_fields) 
             VALUES ($1, $2, $3, $4, $5, 'active', $6) RETURNING *`,
            [title, description, requirements, deadline, createdBy, required_fields.join(",")]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating job:', err);
        res.status(500).send('Error creating job');
    }
};


// Brisanje posla
const deleteJob = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM jobs WHERE job_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).send('Job not found');
        }

        res.status(200).send('Job deleted successfully');
    } catch (err) {
        console.error('Error deleting job:', err);
        res.status(500).send('Error deleting job');
    }
};

// Arhiviranje posla
const archiveJob = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'UPDATE jobs SET status = $1 WHERE job_id = $2 RETURNING *',
            ['archived', id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Job not found');
        }

        res.status(200).send(result.rows[0]);
    } catch (err) {
        console.error('Error archiving job:', err);
        res.status(500).send('Error archiving job');
    }
};

const applyForJob = async (req, res) => {
    const userId = req.user.userId;
    const jobId = req.params.id;

    try {
        // Dohvati informacije o korisniku
        const userResult = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user.experience || !user.education || !user.skills) {
            return res.status(400).json({ error: 'You must complete your profile with experience, education, and skills before applying.' });
        }

        // Dohvati informacije o poslu
        const jobResult = await db.query('SELECT * FROM jobs WHERE job_id = $1', [jobId]);
        const job = jobResult.rows[0];

        const requiredFields = job.required_fields ? job.required_fields.split(',') : [];

        // Provjeri da li je CV potreban i postoji li na profilu
        if (requiredFields.includes('cv') && !user.cv) {
            return res.status(400).json({ error: 'You must upload a CV to apply for this job.' });
        }

        // Provjeri nedostajuće podatke
        const missingFields = [];
        if (requiredFields.includes('cover_letter') && !req.body.cover_letter) missingFields.push('cover_letter');
        if (requiredFields.includes('certificates') && !req.body.certificates) missingFields.push('certificates');

        if (missingFields.length > 0) {
            return res.status(200).json({
                redirect: `/api/jobs/${jobId}/complete-application`,
                missingFields,
            });
        }

        // Provjera postojeće prijave
        const applicationResult = await db.query(
            'SELECT * FROM applications WHERE user_id = $1 AND job_id = $2',
            [userId, jobId]
        );

        if (applicationResult.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }

        // Unos prijave
        const applyResult = await db.query(
            'INSERT INTO applications (user_id, job_id, cv, cover_letter, certificates, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, jobId, user.cv || null, req.body.cover_letter || null, req.body.certificates || null, 'applied']
        );

        res.status(200).json({ message: 'Successfully applied for the job' });
    } catch (err) {
        console.error('Error applying for job:', err);
        res.status(500).json({ error: 'Error applying for job' });
    }
};

// Otkazivanje prijave
const cancelApplication = async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user.userId;

    try {
        const result = await db.query(
            'DELETE FROM applications WHERE job_id = $1 AND user_id = $2 RETURNING *',
            [jobId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        res.status(200).json({ message: 'Application canceled successfully.' });
    } catch (err) {
        console.error('Error canceling application:', err);
        res.status(500).json({ error: 'Error canceling application.' });
    }
};


// Prikaz stranice za unos dodatnih dokumenata
const getCompleteApplicationPage = async (req, res) => {
    const jobId = req.params.id;

    try {
        const jobResult = await db.query('SELECT required_fields FROM jobs WHERE job_id = $1', [jobId]);
        if (jobResult.rows.length === 0) {
            return res.status(404).send('Job not found');
        }

        const requiredFields = jobResult.rows[0].required_fields ? jobResult.rows[0].required_fields.split(',') : [];
        res.render('pages/completeApplication', { jobId, requiredFields });
    } catch (err) {
        console.error('Error fetching job details:', err);
        res.status(500).send('Error fetching job details');
    }
};

// Obrada dodatnih dokumenata i apliciranje
const submitAdditionalDocuments = async (req, res) => {
    const userId = req.user.userId;
    const jobId = req.params.id;
    const { cover_letter } = req.body; // Uzimamo cover_letter iz body-a
    const certificates = req.files?.certificates?.map(file => file.filename).join(',') || null; // Uzimamo certifikate iz uploadanih fajlova

    try {
        // Dohvati podatke o korisniku i poslu iz baze
        const userResult = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        const user = userResult.rows[0];
        const jobResult = await db.query('SELECT required_fields FROM jobs WHERE job_id = $1', [jobId]);
        const job = jobResult.rows[0];
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const requiredFields = job.required_fields ? job.required_fields.split(',') : [];

        // Provjeri nedostajuće podatke i CV ako je potreban
        const missingFields = [];
        if (requiredFields.includes('cv') && !user.cv) {
            missingFields.push('cv');
        }
        if (requiredFields.includes('cover_letter') && !cover_letter) {
            missingFields.push('cover_letter');
        }
        if (requiredFields.includes('certificates') && !certificates) {
            missingFields.push('certificates');
        }

        if (missingFields.length > 0) {
            return res.status(400).json({ error: 'Missing required fields', missingFields });
        }

        // Provjera postojeće prijave
        const applicationResult = await db.query(
            'SELECT * FROM applications WHERE user_id = $1 AND job_id = $2',
            [userId, jobId]
        );

        if (applicationResult.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        // Unos prijave s dodatnim dokumentima
        await db.query(
            'INSERT INTO applications (user_id, job_id, cv, cover_letter, certificates, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, jobId, requiredFields.includes('cv') ? user.cv : null, cover_letter || null, certificates || null, 'applied']
        );

        // Vraćamo uspješnu poruku
        res.status(200).json({ message: 'Successfully applied for the job.' });
    } catch (err) {
        console.error('Error submitting additional documents:', err);
        res.status(500).json({ error: 'Error submitting additional documents.' });
    }
};

module.exports = {
    getAllJobs,
    createJob,
    deleteJob,
    archiveJob,
    applyForJob,
    cancelApplication,
    getCompleteApplicationPage,
    submitAdditionalDocuments
};

const pool = require('../db');
const path = require('path');
const multer = require('multer');

// Konfiguracija za `multer` za upload fajlova
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads'); // Folder za čuvanje fajlova
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generišemo jedinstveno ime za fajl
    }
});
const upload = multer({ storage: storage });

// Dohvatanje profila korisnika
const getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userProfile = result.rows[0];
        res.render('pages/profile', { user: userProfile, role: req.user.role });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
    }
};

// Ažuriranje profila korisnika
const updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { first_name, last_name, email, experience, education, skills } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const updatedFirstName = first_name || user.first_name;
        const updatedLastName = last_name || user.last_name;
        const updatedEmail = email || user.email;
        const updatedExperience = experience || user.experience;
        const updatedEducation = education || user.education;
        const updatedSkills = skills || user.skills;
        const updatedCv = req.file ? `uploads/${path.basename(req.file.path)}` : user.cv;

        const updateResult = await pool.query(
            `UPDATE users 
            SET first_name = $1, last_name = $2, email = $3, experience = $4, education = $5, skills = $6, cv = $7 
            WHERE user_id = $8 RETURNING *`,
            [updatedFirstName, updatedLastName, updatedEmail, updatedExperience, updatedEducation, updatedSkills, updatedCv, userId]
        );

        console.log("Updated user data:", updateResult.rows[0]);

        res.redirect('/api/profile');
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).send('Error updating user profile');
    }
};

module.exports = {
    getProfile,
    updateProfile,
    upload
};

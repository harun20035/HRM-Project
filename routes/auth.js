const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const pool = require('../db');

// Standardne rute za registraciju i prijavu
router.get('/register', (req, res) => {
    res.render('pages/register', { title: 'Register', error: null });
});

router.get('/login', (req, res) => {
    res.render('pages/login', { title: 'Login', error: null });
});

router.get('/logout', (req, res) => {
    res.clearCookie('token'); // Brišemo JWT token
    res.redirect('/api/auth/login'); // Preusmjeravamo na login stranicu
});

// Dodavanje OAuth2 ruta
router.get('/oauth', passport.authenticate('oauth2', {
    scope: ['profile', 'email'] // Tražimo osnovne podatke i email korisnika
}));

router.get('/oauth/callback',
    passport.authenticate('oauth2', { failureRedirect: '/api/auth/login' }),
    async (req, res) => {
        try {
            // Dohvati korisnika iz baze kako bi se osiguralo da svi podaci postoje
            const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id]);
            const user = rows[0];

            if (!user) {
                return res.status(404).json({ error: 'User not found in database' });
            }

            // Generiši JWT token s kompletnim podacima
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    experience: user.experience, // Dodano experience
                    education: user.education,   // Dodano education
                    skills: user.skills          // Dodano skills
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.cookie('token', token, { httpOnly: true });
            res.redirect('/dashboard');
        } catch (err) {
            console.error('Error in /oauth/callback:', err);
            res.status(500).send('Internal Server Error');
        }
    }
);

// Rute za registraciju i prijavu koristeći kontrolere
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

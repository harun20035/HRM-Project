const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Registracija korisnika
const register = async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.render('pages/register', { title: 'Register', error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, first_name, last_name, 'user']
        );

        const { password: _, ...user } = result.rows[0];

        res.redirect('/api/auth/login');
    } catch (err) {
        console.error(err);
        res.render('pages/register', { title: 'Register', error: 'Registration failed' });
    }
};

// Login korisnika
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.render('pages/login', { title: 'Login', error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.render('pages/login', { title: 'Login', error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role, first_name: user.first_name }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const { password: _, ...userWithoutPassword } = user;

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('pages/login', { title: 'Login', error: 'Login failed' });
    }
};


module.exports = { register, login };
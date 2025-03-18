const db = require('../db');

// Dohvati sve korisnike i prikaži stranicu za upravljanje korisnicima
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users ORDER BY user_id');
        res.render('pages/users', { users: result.rows, userRole: req.user.role }); // Dodajemo userRole u context
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching users');
    }
};

// Kreiraj novog korisnika
const createUser = async (req, res) => {
    const { email, password, first_name, last_name, role } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, password, first_name, last_name, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating user');
    }
};

// Dohvati korisnika po ID-u
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user');
    }
};

// Ažuriraj korisnika
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, first_name, last_name, role } = req.body;

    try {
        const result = await db.query(
            'UPDATE users SET email = $1, password = $2, first_name = $3, last_name = $4, role = $5 WHERE user_id = $6 RETURNING *',
            [email, password, first_name, last_name, role, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user');
    }
};

// Obriši korisnika
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting user');
    }
};

// Setuj ulogu korisniku
const setRoles = async (req, res) => {
    const { user_id, role } = req.body;

    // Onemogućiti postavljanje uloge "super_admin"
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).send('Invalid role');
    }

    try {
        // Ažuriraj ulogu korisnika u bazi
        const result = await db.query(
            'UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *',
            [role, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        // Vraćamo poruku o uspehu
        res.status(200).send('User role updated successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user role');
    }
};

module.exports = {
    getAllUsers,
    createUser, 
    getUserById, 
    updateUser, 
    deleteUser, 
    setRoles
};
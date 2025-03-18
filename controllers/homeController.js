const jwt = require('jsonwebtoken');

// Kontroler za početnu stranicu
const getHomePage = (req, res) => {
    const token = req.cookies.token;

    if (token) {
        try {
            // Verifikacija tokena
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/dashboard'); // Preusmjeravanje na dashboard ako je prijavljen
        } catch (err) {
            console.error('Invalid token:', err.message);
            return res.clearCookie('token').redirect('/api/auth/login'); // Ako je token nevalidan, brišemo ga i preusmjeravamo na login
        }
    }

    // Ako korisnik nije prijavljen
    res.render('index', { title: 'Welcome to HRM System', user: null });
};

module.exports = { getHomePage };

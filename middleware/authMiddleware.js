const jwt = require('jsonwebtoken');

// Middleware za provjeru tokena
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('Token not found, redirecting to login');
        return res.redirect('/api/auth/login');
    }

    try {
        // Verifikacija JWT tokena
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Standardizacija ključeva
        req.user = {
            userId: decoded.user_id || decoded.userId, // Podrška za oba ključa
            user_id: decoded.user_id || decoded.userId, // Zadržavamo oba ključa za kompatibilnost
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            role: decoded.role,
            experience: decoded.experience || null,
            education: decoded.education || null,
            skills: decoded.skills || null
        };

        res.locals.user = req.user; // Postavljanje za upotrebu u šablonima
        next();
    } catch (err) {
        console.error('Invalid or expired token:', err.message);
        res.redirect('/api/auth/login');
    }
};

// Middleware za provjeru korisničke uloge (ako ruta zahtijeva specifičnu rolu)
const authorizeRole = (requiredRoles) => (req, res, next) => {
    
    if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ error: `Access denied. Requires one of the following roles: ${requiredRoles.join(', ')}` });
    }
    
    // Ako korisnik ima odgovarajuću rolu, pozivamo next()
    next();
};

module.exports = { authenticateToken, authorizeRole };

const jwt = require('jsonwebtoken');

// Middleware pour authentifier l'utilisateur
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1]; // Format attendu : "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, ... }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide.' });
    }
};

// Middleware pour autoriser uniquement les administrateurs
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
};

module.exports = { authenticate, authorizeAdmin };

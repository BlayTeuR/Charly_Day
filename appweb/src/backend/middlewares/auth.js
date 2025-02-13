const jwt = require('jsonwebtoken');

// Middleware pour authentifier l'utilisateur (utilisé pour protéger les pages privées)
const authenticate = (req, res, next) => {
    // Récupérer le token depuis le cookie
    const token = req.cookies.token;
    if (!token) {
        // S'il n'y a pas de token, rediriger vers la page de login
        return res.redirect('/login');
    }

    try {
        // Vérifier la validité du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Stocker les infos utilisateur dans la requête
        next();
    } catch (error) {
        // En cas d'erreur (token invalide ou expiré), rediriger vers login
        return res.redirect('/login');
    }
};

// Middleware pour rediriger automatiquement vers index si l'utilisateur est déjà authentifié
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // Aucun token, l'utilisateur peut accéder à la page de login
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Si le token est valide, rediriger vers index.html
        return res.redirect('/');
    } catch (error) {
        // Si le token est invalide, continuer (l'utilisateur accède à la page de login)
        return next();
    }
};

// Middleware pour autoriser uniquement les administrateurs (par exemple)
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
};

module.exports = { authenticate, redirectIfAuthenticated, authorizeAdmin };

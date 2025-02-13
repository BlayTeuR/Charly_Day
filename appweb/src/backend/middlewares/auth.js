const jwt = require('jsonwebtoken');
const pool = require('../../database/db');

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
const authorizeAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id; // Récupérer l'ID utilisateur depuis le token

        // Vérifier en base de données si l'utilisateur est admin
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (result.rows[0].is_admin === true) {
            return next();
        }

        return res.status(403).json({ message: "Accès réservé aux administrateurs" });

    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la vérification des permissions" });
    }
};

module.exports = { authenticate, redirectIfAuthenticated, authorizeAdmin };

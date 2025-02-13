const db = require('../../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function validatePassword(password) {
    // Au moins 8 caractères, au moins 1 majuscule, au moins 1 caractère spécial
    const minLength = 8;
    const uppercaseRegex = /[A-Z]/;         // détecte A-Z
    const specialCharRegex = /[^A-Za-z0-9]/; // tout sauf lettres/chiffres

    if (password.length < minLength) {
        return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (!uppercaseRegex.test(password)) {
        return 'Le mot de passe doit contenir au moins une majuscule.';
    }
    if (!specialCharRegex.test(password)) {
        return 'Le mot de passe doit contenir au moins un caractère spécial.';
    }
    // Sinon, c'est OK
    return null;
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier que l'email et le password existent
        if (!email || !password) {
            // On peut envoyer le même message d'erreur générique
            return res.status(401).json({ message: 'mot de passe ou email incorrect' });
        }

        // Vérifier si un user correspond à cet email
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        const user = rows[0];

        // Si pas de user trouvé => erreur
        if (!user) {
            return res.status(401).json({ message: 'mot de passe ou email incorrect' });
        }

        // Comparer le mot de passe envoyé avec le hash stocké
        const isValid = await bcrypt.compare(password, user.hash_password);
        if (!isValid) {
            return res.status(401).json({ message: 'mot de passe ou email incorrect' });
        }

        // Déterminer le rôle
        const userRole = user.admin ? 'admin' : 'client';

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Stocker le token dans un cookie HTTP-only
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Succès => renvoyer un JSON 200
        return res.status(200).json({ message: 'Connexion réussie' });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        // En cas d'erreur serveur, tu peux renvoyer un 500
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// backend/controllers/authController.js (extrait)

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirm_password, situation } = req.body;

        // Vérifier que l'email, le mot de passe et la confirmation sont fournis
        if (!email || !password || !confirm_password) {
            return res.status(400).json({
                message: 'Veuillez fournir un email, un mot de passe et confirmer le mot de passe'
            });
        }

        // Vérifier que les mots de passe correspondent
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
        }

        // Vérifier la force du mot de passe (majuscule, spécial, min 8 chars)
        const passwordError = validatePassword(password);
        if (passwordError) {
            // On renvoie un code 400, mais on place le message dans un champ `passwordError`
            return res.status(400).json({ passwordError });
        }

        // Vérifier si l'utilisateur existe déjà
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(checkQuery, [email]);
        if (rows.length > 0) {
            // Email déjà utilisé
            return res.status(400).json({ message: 'Cet email est déjà utilisé pour un autre compte' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Définir la situation
        const userSituation = typeof situation === 'boolean' ? situation : false;

        // Insertion en BDD
        const insertQuery = `
      INSERT INTO users (first_name, last_name, email, hash_password, situation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await db.query(insertQuery, [first_name, last_name, email, hashedPassword, userSituation]);
        const newUser = result.rows[0];

        // Rôle (admin ou client)
        const userRole = newUser.admin ? 'admin' : 'client';

        // Générer le token JWT
        const token = jwt.sign(
            { id: newUser.id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Placer le token dans un cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Tout est OK => on renvoie 200
        return res.status(200).json({ message: 'Inscription réussie' });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

module.exports = { login, register };


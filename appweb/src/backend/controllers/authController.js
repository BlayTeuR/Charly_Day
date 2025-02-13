const db = require('../../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {getUserByEmail} = require("../models/user");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
        }

        const user = getUserByEmail(email);

        // Comparer le mot de passe envoyé avec le hash stocké (colonne hash_password)
        const isValid = await bcrypt.compare(password, user.hash_password);
        if (!isValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        // Déterminer le rôle à partir de la colonne admin (vous pouvez adapter selon vos besoins)
        const userRole = user.admin ? 'admin' : 'client';

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, situation } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
        }

        // Vérifier si l'utilisateur existe déjà
        const checkQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(checkQuery, [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Définir la situation par défaut à false (client) si non fournie
        const userSituation = typeof situation === 'boolean' ? situation : false;

        // Insérer le nouvel utilisateur dans la base de données
        const insertQuery = `
            INSERT INTO users (email, hash_password, situation)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(insertQuery, [email, hashedPassword, userSituation]);
        const newUser = result.rows[0];

        // Déterminer le rôle pour le token
        const userRole = newUser.admin ? 'admin' : 'client';

        // Générer le token JWT pour l'utilisateur nouvellement créé
        const token = jwt.sign(
            { id: newUser.id, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

module.exports = { login, register };

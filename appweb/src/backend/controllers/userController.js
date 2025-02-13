const pool = require('../../database/db');

// ➤ 1. Créer un utilisateur
exports.createUser = async (req, res) => {
    try {
        const { email, hash_password, admin, situation } = req.body;
        const result = await pool.query(
            'INSERT INTO users (email, hash_password, admin, situation) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, hash_password, admin, situation]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 2. Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 3. Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 4. Modifier un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, hash_password, admin, situation } = req.body;
        const result = await pool.query(
            'UPDATE users SET email = $1, hash_password = $2, admin = $3, situation = $4 WHERE id = $5 RETURNING *',
            [email, hash_password, admin, situation, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 5. Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

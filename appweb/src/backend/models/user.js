const pool = require('../../database/db');
const db = require("../../database/db");

// Créer un nouvel utilisateur
const createUser = async ({ email, hash_password, admin, situation }) => {
    const query = `
        INSERT INTO users (email, hash_password, admin, situation)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [email, hash_password, admin, situation];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Récupérer un utilisateur par son identifiant
const getUserById = async (id) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

//Récupérer un utilisateur par email
const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
}

// Récupérer tous les utilisateurs
const getAllUsers = async () => {
    const query = `SELECT * FROM users`;
    const { rows } = await pool.query(query);
    return rows;
};

// Mettre à jour un utilisateur par son identifiant
const updateUser = async (id, { email, hash_password, admin, situation }) => {
    const query = `
        UPDATE users
        SET email = $1, hash_password = $2, admin = $3, situation = $4
        WHERE id = $5
        RETURNING *
    `;
    const values = [email, hash_password, admin, situation, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Supprimer un utilisateur par son identifiant
const deleteUser = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser
};

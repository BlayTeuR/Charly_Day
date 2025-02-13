const db = require('../config/db');

// Créer un nouveau produit
const createProduct = async ({ name, description, price, stock }) => {
    const query = `
    INSERT INTO products (name, description, price, stock)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const values = [name, description, price, stock];
    const { rows } = await db.query(query, values);
    return rows[0];
};

// Récupérer un produit par son identifiant
const getProductById = async (id) => {
    const query = `SELECT * FROM products WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

// Récupérer tous les produits
const getAllProducts = async () => {
    const query = `SELECT * FROM products ORDER BY id DESC`;
    const { rows } = await db.query(query);
    return rows;
};

// Mettre à jour un produit par son identifiant
const updateProduct = async (id, { name, description, price, stock }) => {
    const query = `
    UPDATE products
    SET name = $1, description = $2, price = $3, stock = $4
    WHERE id = $5
    RETURNING *
  `;
    const values = [name, description, price, stock, id];
    const { rows } = await db.query(query, values);
    return rows[0];
};

// Supprimer un produit par son identifiant
const deleteProduct = async (id) => {
    const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
};

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct
};

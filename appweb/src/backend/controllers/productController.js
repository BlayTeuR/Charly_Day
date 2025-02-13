const pool = require('../../database/db');

// ➤ 1. Ajouter un produit
exports.createProduct = async (req, res) => {
    try {
        const { name, description, imagepath, price, stock, category } = req.body;
        const result = await pool.query(
            'INSERT INTO products (name, description, imagepath, price, stock, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, imagepath, price, stock, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 2. Récupérer tous les produits
exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 3. Récupérer un produit par ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 4. Modifier un produit
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, imagepath, price, stock, category } = req.body;
        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, imagepath = $3, price = $4, stock = $5, category = $6 WHERE id = $7 RETURNING *',
            [name, description, imagepath, price, stock, category, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 5. Supprimer un produit
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json({ message: 'Produit supprimé', product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

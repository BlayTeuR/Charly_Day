const pool = require('../../database/db');

// ➤ 1. Ajouter un produit au panier
exports.addToCart = async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        // Vérifier si l'utilisateur a déjà un panier
        let cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [user_id]);
        if (cart.rows.length === 0) {
            cart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [user_id]);
        }
        const cart_id = cart.rows[0].id;

        // Ajouter l'article au panier
        const result = await pool.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [cart_id, product_id, quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 2. Voir le panier d'un utilisateur
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(`
            SELECT ci.id, p.name, p.price, p.imagepath, ci.quantity 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = $1`, [userId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 3. Modifier la quantité d'un produit
exports.updateCartItem = async (req, res) => {
    try {
        const { cartItemId, quantity } = req.body;
        const result = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, cartItemId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ➤ 4. Supprimer un produit du panier
exports.removeFromCart = async (req, res) => {
    try {
        const { cartId, productId } = req.params;

        // Vérifier si l'article existe dans le panier
        const result = await pool.query(
            'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
            [cartId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé dans le panier' });
        }

        res.json({ message: 'Produit supprimé du panier', deletedItem: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ➤ 5. Vider le panier
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)', [userId]);
        res.json({ message: 'Panier vidé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

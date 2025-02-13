// backend/controllers/orderController.js
const db = require('../../database/db');

/**
 * Récupère toutes les commandes.
 */
const getAllOrders = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getAllOrders:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Récupère les détails d'une commande, y compris ses order_items.
 */
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        // 1) Récupère la commande en elle-même
        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }
        const order = orderResult.rows[0];

        // 2) Récupère les order_items liés
        const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

        // 3) On renvoie un objet combiné (commande + items)
        res.status(200).json({
            ...order,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Erreur getOrderById:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Crée une nouvelle commande.
 * On peut s'attendre à recevoir { user_id, total, status, items[] } (optionnel).
 */
const createOrder = async (req, res) => {
    try {
        const { user_id, total, status, items } = req.body;

        const orderStatus = status || 'pending';

        // Insertion dans la table orders
        const insertOrderQuery = `
      INSERT INTO orders (user_id, status, total)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const insertValues = [user_id, orderStatus, total];
        const orderResult = await db.query(insertOrderQuery, insertValues);
        const newOrder = orderResult.rows[0]; // id, user_id, status, total, created_at

        // Si on veut gérer order_items en même temps
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const { product_id, quantity, price } = item;
                await db.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
                    [newOrder.id, product_id, quantity, price]
                );
            }
        }

        // Récupérer tous les items qu'on vient d'insérer
        const orderItemsResult = await db.query('SELECT * FROM order_items WHERE order_id = $1', [newOrder.id]);

        res.status(201).json({
            order: newOrder,
            items: orderItemsResult.rows
        });
    } catch (error) {
        console.error('Erreur createOrder:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Met à jour une commande (status, total, etc.).
 */
const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, total } = req.body;

        const updateQuery = `
      UPDATE orders
      SET status = COALESCE($1, status),
          total  = COALESCE($2, total)
      WHERE id = $3
      RETURNING *
    `;
        const updateValues = [status, total, orderId];
        const { rows } = await db.query(updateQuery, updateValues);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erreur updateOrder:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Supprime une commande.
 */
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const deleteQuery = 'DELETE FROM orders WHERE id = $1 RETURNING *';
        const { rows } = await db.query(deleteQuery, [orderId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }

        res.status(200).json({ message: 'Commande supprimée avec succès' });
    } catch (error) {
        console.error('Erreur deleteOrder:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};

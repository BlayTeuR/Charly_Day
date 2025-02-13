// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Importation des contrôleurs
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

// GET /orders => liste toutes les commandes
router.get('/', getAllOrders);

// GET /orders/:id => détail d'une commande
router.get('/:id', getOrderById);

// POST /orders => créer une commande
router.post('/', createOrder);

// PUT /orders/:id => modifier une commande
router.put('/:id', updateOrder);

// DELETE /orders/:id => supprimer une commande
router.delete('/:id', deleteOrder);

module.exports = router;

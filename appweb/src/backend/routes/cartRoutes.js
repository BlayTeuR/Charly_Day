const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Gestion du panier
router.post('/add', cartController.addToCart);   // Ajouter un produit au panier
router.get('/:userId', cartController.getCart);  // Voir le panier d'un utilisateur
router.put('/update', cartController.updateCartItem); // Modifier la quantité d'un article
router.delete('/remove/:cartItemId', cartController.removeFromCart); // Supprimer un produit du panier
router.delete('/clear/:userId', cartController.clearCart); // Vider le panier

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    addProduct,
    getProduct,
    listProducts,
    updateProductController,
    deleteProductController
} = require('../controllers/productController');

// Route pour ajouter un produit
router.post('/', addProduct);

// Route pour lister tous les produits
router.get('/', listProducts);

// Route pour récupérer un produit spécifique
router.get('/:id', getProduct);

// Route pour mettre à jour un produit
router.put('/:id', updateProductController);

// Route pour supprimer un produit
router.delete('/:id', deleteProductController);

module.exports = router;

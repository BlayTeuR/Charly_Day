const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// CRUD Produits
router.post('/', productController.createProduct);   // Ajouter un produit
router.get('/', productController.getAllProducts);   // Récupérer tous les produits
router.get('/:id', productController.getProductById); // Récupérer un produit par ID
router.put('/:id', productController.updateProduct); // Modifier un produit
router.delete('/:id', productController.deleteProduct); // Supprimer un produit

module.exports = router;

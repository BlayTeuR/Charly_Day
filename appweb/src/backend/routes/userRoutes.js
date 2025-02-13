const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// Routes CRUD pour les utilisateurs
router.post('/', userController.createUser);   // Créer un utilisateur
router.get('/', userController.getAllUsers);   // Récupérer tous les utilisateurs
router.get('/:id', userController.getUserById); // Récupérer un utilisateur par ID
router.put('/:id', userController.updateUser); // Modifier un utilisateur
router.delete('/:id', userController.deleteUser); // Supprimer un utilisateur

module.exports = router;
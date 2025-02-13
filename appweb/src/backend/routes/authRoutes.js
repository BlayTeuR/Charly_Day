const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const {authenticate} = require("../middlewares/auth");

// Endpoint pour la connexion
router.post('/login', login);
router.post('/register', register)

// Endpoint pour récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticate, (req, res) => {
    res.json({ id: req.user.id, role: req.user.role });
});

module.exports = router;

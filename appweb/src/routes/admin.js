const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

//route admin protégée
router.get('/dashboard', authenticate, authorizeAdmin, (req, res) => {
    res.json({ message: 'Bienvenue dans le back-office administrateur' });
});

module.exports = router;

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

// Middleware pour parser le JSON
app.use(express.json());

//Configure le dossier 'html' qui contient les pages
app.use(express.static(path.join(__dirname, 'html')));

// Routes d'authentification
const authRoutes = require('./src/backend/routes/auth');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./src/backend/routes/admin');
app.use('/api/admin', adminRoutes);

// Routes Back-office
const productRoutes = require('./src/backend/routes/product');
app.use('/backoffice/products', productRoutes);

// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('Backend démarré !');
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

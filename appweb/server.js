const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

// Middleware pour parser le JSON
app.use(express.json());

// Routes d'authentification
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./src/routes/admin');
app.use('/api/admin', adminRoutes);

// Routes Back-office
const productRoutes = require('./src/routes/product');
app.use('/backoffice/products', productRoutes);


// Importer les routes

app.use('/api/besoins', besoinsRoutes);

// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('Backend démarré !');
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

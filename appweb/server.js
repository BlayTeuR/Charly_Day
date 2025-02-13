const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Importer les routes
const besoinsRoutes = require('./src/routes/besoins');
app.use('/api/besoins', besoinsRoutes);

// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('Backend démarré !');
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

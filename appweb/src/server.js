const express = require('express');
const pool = require('./database/db.js')
const port = process.env.PORT || 3000;
const app = express();
const path = require('path');


// Middleware pour parser le JSON
app.use(express.json());

// Route pour tester la connexion PostgreSQL
app.get('/test-db', async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.json({message: 'Connexion réussie', time: result.rows[0]});
    } catch(err){
        res.status(500).json({error: err.message})
    }
});

// Routes d'authentification
const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./backend/routes/admin');
app.use('/api/admin', adminRoutes);

// Routes Back-office
const productRoutes = require('./backend/routes/productRoutes');
app.use('/backoffice/products', productRoutes);


// ### IMPORTATION DES ROUTES
// on importe les routes pour la gestion de l'utilisateur dans la bdd
const userRoutes = require('./backend/routes/userRoutes');
app.use('/users', userRoutes);


// Route GET pour sevir les différentes page de l'applicaton
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});


// Route racine pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('Backend démarré !');
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

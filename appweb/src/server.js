const express = require('express');
const pool = require('./database/db.js')
const port = process.env.PORT || 3000;
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');


// Middleware pour parser le JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'js')));

// Route pour tester la connexion PostgreSQL
app.get('/test-db', async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.json({message: 'Connexion réussie', time: result.rows[0]});
    } catch(err){
        res.status(500).json({error: err.message})
    }
});

app.get('js/index.js', async (req, res) => {
    res.sendFile('/js/index.js');
})
// Routes d'authentification
const authRoutes = require('./backend/routes/authRoutes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./backend/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Routes Back-office
const productRoutes = require('./backend/routes/productRoutes');
app.use('/products', productRoutes);


// ### IMPORTATION DES ROUTES
// on importe les routes pour la gestion de l'utilisateur dans la bdd
const userRoutes = require('./backend/routes/userRoutes');
const {authenticate} = require("./backend/middlewares/auth");
app.use('/users', userRoutes);

app.use('/img', express.static(path.join(__dirname, 'img')));

// Route GET pour sevir les différentes page de l'applicaton
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});
app.get('/login.html', (req, res) => {
    res.redirect('/login');
});

app.get('/checkout', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'checkout.html'));
});

app.get('/commander', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        // Pas de token => pas connecté
        return res.redirect('/login');
    }
    try {
        // Vérifie si le token est valide
        jwt.verify(token, process.env.JWT_SECRET);

        // Ici, tu peux insérer la commande en base, ou faire toute autre logique.
        // Une fois la commande validée, on redirige l'utilisateur vers la page d'accueil
        // avec un paramètre de succès.
        return res.redirect('/?commandeSuccess=true');
    } catch (err) {
        // Token invalide/expiré => redirige vers /login
        return res.redirect('/login');
    }
});


app.get('/produits', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'page_produits.html'));
});


// Route racine pour vérifier que le serveur fonctionne
app.get('/index.html', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

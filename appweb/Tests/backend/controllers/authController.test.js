const { register,login} = require('../../../src/backend/controllers/authController');
const pool = require('../../../src/database/db');

const db = require('../../../src/database/db')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
jest.mock('../../../src/database/db');
jest.mock('jsonwebtoken')
jest.mock('bcryptjs')

describe('login', () => {
    it('devrait connecter un utilisateur avec un mot de passe valide et rediriger vers index.html', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            redirect: jest.fn(),
        };

        const user = {
            id: 1,
            email: 'test@example.com',
            hash_password: '$2b$10$y5j0/JGpt0L1.WqS9w4aeXq9FwvlZsz0PlxV9QX8seHWBGIFzz8MC', // Exemple de hash pour 'password123'
            admin: false,
        };

        db.query.mockResolvedValueOnce({ rows: [user] }); // Mock de la recherche d'utilisateur
        bcrypt.compare.mockResolvedValueOnce(true); // Mock de la comparaison du mot de passe
        jwt.sign.mockReturnValueOnce('fake-jwt-token'); // Mock du token JWT

        await login(req, res);

        expect(res.status).not.toHaveBeenCalled(); // Pas d'erreur, donc pas de statut 400 ou 401
        expect(res.cookie).toHaveBeenCalledWith('token', 'fake-jwt-token', expect.objectContaining({ httpOnly: true }));
        expect(res.redirect).toHaveBeenCalledWith('/'); // Redirection vers index.html
    });
    it('devrait retourner une erreur si l\'email ou le mot de passe est manquant', async () => {
        const req = {
            body: {
                email: '',
                password: '',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Veuillez fournir un email et un mot de passe',
        });
    });
    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
        const req = {
            body: {
                email: 'nonexistent@example.com',
                password: 'password123',
                hash_password: '$2b$10$y5j0/JGpt0L1.WqS9w4aeXq9FwvlZsz0PlxV9QX8seHWBGIFzz8MC', // Exemple de hash pour 'password123'
                admin: false,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        db.query.mockResolvedValueOnce({ rows: [] }); // L'utilisateur n'existe pas

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe incorrect' });
    });
    it('devrait retourner une erreur si le mot de passe est incorrect', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'wrongpassword',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const user = {
            id: 1,
            email: 'test@example.com',
            hash_password: '$2b$10$y5j0/JGpt0L1.WqS9w4aeXq9FwvlZsz0PlxV9QX8seHWBGIFzz8MC',
            admin: false,
        };

        db.query.mockResolvedValueOnce({ rows: [user] }); // L'utilisateur existe
        bcrypt.compare.mockResolvedValueOnce(false); // Le mot de passe est incorrect

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe incorrect' });
    });
    it('devrait retourner une erreur 500 en cas de problème avec la base de données', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        db.query.mockRejectedValueOnce(new Error('Database error')); // Simuler une erreur de base de données

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur interne du serveur' });
    });

});

describe('register', () => {
    it('devrait inscrire un utilisateur et rediriger vers index.html', async () => {
        const req = {
            body: {
                email: 'newuser@example.com',
                password: 'password123',
                confirm_password: 'password123',
                situation: false,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            redirect: jest.fn(),
        };

        const existingUserQueryResult = { rows: [] }; // Aucun utilisateur existant
        const hashedPassword = 'hashedPassword123'; // Mot de passe hashé
        const newUser = {
            id: 1,
            email: 'newuser@example.com',
            hash_password: hashedPassword,
            situation: false,
            admin: false,
        };

        // Mocks
        db.query.mockResolvedValueOnce(existingUserQueryResult); // Aucun utilisateur avec cet email
        bcrypt.hash.mockResolvedValueOnce(hashedPassword); // Mot de passe hashé avec succès
        db.query.mockResolvedValueOnce({ rows: [newUser] }); // Insertion réussie
        jwt.sign.mockReturnValueOnce('fake-jwt-token'); // Génération du token

        await register(req, res);

        expect(res.status).not.toHaveBeenCalled(); // Pas d'erreur, donc pas de statut d'erreur
        expect(res.cookie).toHaveBeenCalledWith('token', 'fake-jwt-token', expect.objectContaining({ httpOnly: true }));
        expect(res.redirect).toHaveBeenCalledWith('/'); // Redirection vers index.html
    });
    it('devrait retourner une erreur si l\'email, le mot de passe ou la confirmation sont manquants', async () => {
        const req = {
            body: {
                email: '',
                password: '',
                confirm_password: '',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Veuillez fournir un email, un mot de passe et confirmer le mot de passe',
        });
    });
    it('devrait retourner une erreur si les mots de passe ne correspondent pas', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
                confirm_password: 'differentpassword',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Les mots de passe ne correspondent pas',
        });
    });
    it('devrait retourner une erreur si l\'email est déjà utilisé', async () => {
        const req = {
            body: {
                email: 'existinguser@example.com',
                password: 'password123',
                confirm_password: 'password123',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const existingUserQueryResult = { rows: [{ email: 'existinguser@example.com' }] }; // Utilisateur déjà existant
        db.query.mockResolvedValueOnce(existingUserQueryResult); // Simuler l'email existant dans la base de données

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Email déjà utilisé',
        });
    });
    it('devrait retourner une erreur 400 si le mot de passe est trop court', async () => {
        const req = {
            body: {
                email: 'newuser@example.com',
                password: '123',  // Mot de passe trop court
                confirm_password: '123',
                situation: false,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req, res);

        // Vérifier que l'erreur 400 a été renvoyée
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Le mot de passe doit contenir au moins 6 caractères',
        });
    });
    it('devrait retourner une erreur 400 si l\'email est invalide', async () => {
        const req = {
            body: {
                email: 'invalid-email',  // Email invalide
                password: 'password123',
                confirm_password: 'password123',
                situation: false,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req, res);

        // Vérifier que l'erreur 400 a été renvoyée
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'L\'email est invalide',
        });
    });
    it('devrait retourner une erreur 500 en cas de problème avec l\'insertion de l\'utilisateur', async () => {
        const req = {
            body: {
                email: 'newuser@example.com',
                password: 'password123',
                confirm_password: 'password123',
                situation: false,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const existingUserQueryResult = {rows: []}; // Aucun utilisateur existant
        db.query.mockResolvedValueOnce(existingUserQueryResult); // Aucun utilisateur avec cet email
        bcrypt.hash.mockResolvedValueOnce('hashedPassword123'); // Hashage du mot de passe réussi
        db.query.mockRejectedValueOnce(new Error('Database error')); // Erreur lors de l'insertion de l'utilisateur

        // Essayer d'exécuter la fonction et s'assurer qu'une erreur est lancée
        await expect(register(req, res)).rejects.toThrow('Database error');

        // Vérifier que la réponse d'erreur 500 a bien été envoyée
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erreur interne du serveur',
        });
    })
});




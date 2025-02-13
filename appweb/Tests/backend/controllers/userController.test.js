const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../../../src/backend/controllers/userController'); // Importer la fonction
const pool = require('../../../src/database/db');

// Mock de la méthode pool.query
jest.mock('../../../src/database/db');

describe('createUser', () => {
    it('devrait créer un utilisateur avec succès', async () => {
        const mockUser = {
            id: 1,
            email: 'user@example.com',
            hash_password: 'hashedPassword',
            admin: false,
            situation: 'active'
        };

        // Mock de la réponse de la base de données
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        // Crée des objets simulés pour `req` et `res`
        const req = {
            body: {
                email: 'user@example.com',
                hash_password: 'hashedPassword',
                admin: false,
                situation: 'active'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode `createUser` avec les objets mockés
        await createUser(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 201
        expect(res.status).toHaveBeenCalledWith(201);

        // Vérifier que `json` a bien été appelé avec l'utilisateur mocké
        expect(res.json).toHaveBeenCalledWith(mockUser);

        // Vérifier que la requête a été exécutée avec les bons paramètres
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO users (email, hash_password, admin, situation) VALUES ($1, $2, $3, $4) RETURNING *',
            ['user@example.com', 'hashedPassword', false, 'active']
        );
    });

    it('devrait retourner une erreur si la base de données échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {
            body: {
                email: 'user@example.com',
                hash_password: 'hashedPassword',
                admin: false,
                situation: 'active'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode `createUser` avec les objets mockés
        await createUser(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que `json` a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });
    it('devrait échouer si un champ requis est manquant', async () => {
        const req = {
            body: {
                // L'email est manquant
                hash_password: 'hashedPassword',
                admin: false,
                situation: 'active'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createUser
        await createUser(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a été appelé avec un message d'erreur indiquant qu'un champ est manquant
        expect(res.json).toHaveBeenCalledWith({ error : "Email manquant"});
    });
    it("devrait échouer si une adresse email existe déjà", async  () => {
        const req = {
            body: {
                email: 'user@example.com',
                hash_password: 'hashedPassword',
                admin: false,
                situation: 'active'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Simuler une erreur de base de données (par exemple, contrainte d'unicité)
        pool.query.mockRejectedValueOnce(new Error('Duplicate key value violates unique constraint'));

        // Appeler la méthode createUser
        await createUser(req, res);

        // Vérifier que la méthode status a été appelée avec 400 (mauvaise requête)
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a été appelé avec un message d'erreur indiquant que l'email est déjà utilisé
        expect(res.json).toHaveBeenCalledWith({ error: 'Email déjà utilisé' });
    })
    it('devrait retourner une erreur générique pour des erreurs inattendues', async () => {
        // Simuler une erreur générique (pas une erreur liée à la base de données)
        pool.query.mockRejectedValueOnce(new Error('Une erreur inattendue'));

        const req = {
            body: {
                email: 'user@example.com',
                hash_password: 'hashedPassword',
                admin: false,
                situation: 'active'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createUser
        await createUser(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a été appelé avec un message d'erreur générique
        expect(res.json).toHaveBeenCalledWith({ error: 'Une erreur inattendue' });
    });

});
describe('getAllUsers', () => {
    it('devrait récupérer tous les utilisateurs avec succès', async () => {
        const mockUsers = [
            { id: 1, email: 'user1@example.com', admin: false, situation: 'active' },
            { id: 2, email: 'user2@example.com', admin: true, situation: 'inactive' }
        ];

        // Simuler la réponse de la base de données
        pool.query.mockResolvedValueOnce({ rows: mockUsers });

        const req = {}; // Pas besoin de body ici
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getAllUsers
        await getAllUsers(req, res);

        // Vérifier que json a bien été appelé avec les utilisateurs
        expect(res.json).toHaveBeenCalledWith(mockUsers);

        // Vérifier que la requête a été exécutée
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users');
    });
    it("devrait retourner une erreur si la base de données echoue", async () =>{
        pool.query.mockRejectedValueOnce(new Error("erreur de la BD"))

        req = {}
        const res = {
            status : jest.fn().mockReturnThis(),
            json : jest.fn()
        };
        await getAllUsers(req,res)
        expect(res.status).toHaveBeenCalledWith(500)
    })
    it("devrait retourner un tableau vide quand il n'y a aucun utilisateur dans la BD", async () =>{
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = {}; // Pas besoin de body ici
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getAllUsers
        await getAllUsers(req, res);

        // Vérifier que json a bien été appelé avec un tableau vide
        expect(res.json).toHaveBeenCalledWith([]);

        // Vérifier que la requête a été exécutée
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users');
    })
    it('devrait retourner une erreur générique pour des erreurs imprévues', async () => {
        // Simuler une erreur générique
        pool.query.mockRejectedValueOnce(new Error('Une erreur inattendue'));

        const req = {}; // Pas besoin de body ici
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getAllUsers
        await getAllUsers(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a été appelé avec un message d'erreur générique
        expect(res.json).toHaveBeenCalledWith({error: 'Une erreur inattendue'});
    })
});
describe('getUserById', () => {

    it('devrait retourner un utilisateur lorsqu\'il existe', async () => {
        const mockUser = {
            id: 1,
            email: 'user@example.com',
            hash_password: 'hashedPassword',
            admin: false,
            situation: 'active'
        };

        // Mock de la réponse de la base de données (utilisateur trouvé)
        pool.query.mockResolvedValueOnce({ rows: [mockUser] });

        const req = { params: { id: 1 } }; // ID de l'utilisateur
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getUserById avec les objets mockés
        await getUserById(req, res);

        // Vérifier que la méthode status n'a pas été appelée avec 404
        expect(res.status).not.toHaveBeenCalledWith(404);

        // Vérifier que json a bien été appelé avec l'utilisateur trouvé
        expect(res.json).toHaveBeenCalledWith(mockUser);

        // Vérifier que la requête a été exécutée avec l'ID correct
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('devrait retourner une erreur 404 si l\'utilisateur n\'est pas trouvé', async () => {
        // Mock de la réponse de la base de données (aucun utilisateur trouvé)
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = { params: { id: 999 } }; // ID d'utilisateur inexistant
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getUserById avec les objets mockés
        await getUserById(req, res);

        // Vérifier que la méthode status a été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé' });
    });

    it('devrait retourner une erreur 500 si la requête échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = { params: { id: 1 } }; // ID d'utilisateur
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode getUserById avec les objets mockés
        await getUserById(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });

});
describe('updateUser', () => {

    it('devrait mettre à jour un utilisateur avec succès', async () => {
        const mockUpdatedUser = {
            id: 1,
            email: 'updated@example.com',
            hash_password: 'newHashedPassword',
            admin: false,
            situation: 'active'
        };

        // Mock de la réponse de la base de données (utilisateur mis à jour)
        pool.query.mockResolvedValueOnce({ rows: [mockUpdatedUser] });

        const req = {
            params: { id: 1 }, // ID de l'utilisateur
            body: {
                email: 'updated@example.com',
                hash_password: 'newHashedPassword',
                admin: false,
                situation: 'active'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode updateUser avec les objets mockés
        await updateUser(req, res);

        // Vérifier que la méthode json a bien été appelée avec l'utilisateur mis à jour
        expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);

        // Vérifier que la requête a été exécutée avec les bons paramètres
        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE users SET email = $1, hash_password = $2, admin = $3, situation = $4 WHERE id = $5 RETURNING *',
            ['updated@example.com', 'newHashedPassword', false, 'active', 1]
        );
    });

    it('devrait retourner une erreur 404 si l\'utilisateur n\'est pas trouvé', async () => {
        // Mock de la réponse de la base de données (aucun utilisateur trouvé)
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = {
            params: { id: 999 }, // ID d'utilisateur inexistant
            body: {
                email: 'updated@example.com',
                hash_password: 'newHashedPassword',
                admin: false,
                situation: 'active'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode updateUser avec les objets mockés
        await updateUser(req, res);

        // Vérifier que la méthode status a été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé' });
    });

    it('devrait retourner une erreur 500 si la requête échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {
            params: { id: 1 }, // ID d'utilisateur
            body: {
                email: 'updated@example.com',
                hash_password: 'newHashedPassword',
                admin: false,
                situation: 'active'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode updateUser avec les objets mockés
        await updateUser(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });

});

describe('deleteUser', () => {

    it('devrait supprimer un utilisateur avec succès', async () => {
        const mockDeletedUser = {
            id: 1,
            email: 'user@example.com',
            hash_password: 'hashedPassword',
            admin: false,
            situation: 'active'
        };

        // Mock de la réponse de la base de données (utilisateur supprimé)
        pool.query.mockResolvedValueOnce({ rows: [mockDeletedUser] });

        const req = {
            params: { id: 1 } // ID de l'utilisateur
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode deleteUser avec les objets mockés
        await deleteUser(req, res);

        // Vérifier que la méthode json a bien été appelée avec un message de confirmation et l'utilisateur supprimé
        expect(res.json).toHaveBeenCalledWith({
            message: 'Utilisateur supprimé',
            user: mockDeletedUser
        });

        // Vérifier que la requête a été exécutée avec le bon ID
        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [1]
        );
    });

    it('devrait retourner une erreur 404 si l\'utilisateur n\'est pas trouvé', async () => {
        // Mock de la réponse de la base de données (aucun utilisateur trouvé)
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = {
            params: { id: 999 } // ID d'utilisateur inexistant
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode deleteUser avec les objets mockés
        await deleteUser(req, res);

        // Vérifier que la méthode status a été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Utilisateur non trouvé' });
    });

    it('devrait retourner une erreur 500 si la requête échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {
            params: { id: 1 } // ID d'utilisateur
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode deleteUser avec les objets mockés
        await deleteUser(req, res);

        // Vérifier que la méthode status a été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });

});
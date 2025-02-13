const { createProduct,deleteProduct,getAllProducts,getProductById, updateProduct } = require("../../../src/backend/controllers/productController")

const pool = require('../../../src/database/db');

// Mock de la méthode pool.query
jest.mock('../../../src/database/db');

describe('createProduct', () => {

    it('devrait créer un produit avec succès', async () => {
        const mockProduct = {
            id: 1,
            name: 'Produit A',
            description: 'Description du produit A',
            imagepath: '/images/produitA.jpg',
            price: 29.99,
            stock: 100,
            category: 'Electronics'
        };

        // Mock de la réponse de la base de données (produit créé avec succès)
        pool.query.mockResolvedValueOnce({ rows: [mockProduct] });

        const req = {
            body: {
                name: 'Produit A',
                description: 'Description du produit A',
                imagepath: '/images/produitA.jpg',
                price: 29.99,
                stock: 100,
                category: 'Electronics'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode json a bien été appelée avec le produit créé
        expect(res.json).toHaveBeenCalledWith(mockProduct);

        // Vérifier que la requête a été exécutée avec les bons paramètres
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO products (name, description, imagepath, price, stock, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            ['Produit A', 'Description du produit A', '/images/produitA.jpg', 29.99, 100, 'Electronics']
        );
    });

    it('devrait retourner une erreur 400 si un champ est manquant', async () => {
        pool.query.mockRejectedValueOnce(new Error("null value in column \"name\" violates not-null constraint"))
        const req = {
            body: {
                // Le champ 'name' est manquant
                description: 'Description du produit A',
                imagepath: '/images/produitA.jpg',
                price: 29.99,
                stock: 100,
                category: 'Electronics'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode status a bien été appelée avec 400 (Bad Request)
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a bien été appelé avec un message d'erreur pour 'name manquant'
        expect(res.json).toHaveBeenCalledWith({ error: 'Nom du produit manquant' });
    });

    it('devrait retourner une erreur 400 si le prix est invalide', async () => {
        pool.query.mockRejectedValueOnce(new Error("null value in column \"price\" violates not-null constraint"))

        const req = {
            body: {
                name: 'Produit A',
                description: 'Description du produit A',
                imagepath: '/images/produitA.jpg',
                price: 'invalid_price', // Prix invalide (non numérique)
                stock: 100,
                category: 'Electronics'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode status a bien été appelée avec 400 (Bad Request)
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a bien été appelé avec un message d'erreur pour 'prix invalide'
        expect(res.json).toHaveBeenCalledWith({ error: 'Prix invalide' });
    });
    it('devrait retourner une erreur 500 si la requête échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {
            body: {
                name: 'Produit A',
                description: 'Description du produit A',
                imagepath: '/images/produitA.jpg',
                price: 29.99,
                stock: 100,
                category: 'Electronics'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode status a bien été appelée avec 500 (Internal Server Error)
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que json a bien été appelé avec l'erreur de base de données
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });

    it('devrait retourner une erreur 400 si la catégorie est manquante', async () => {
        pool.query.mockRejectedValueOnce(new Error("null value in column \"category\" violates not-null constraint"))

        const req = {
            body: {
                name: 'Produit A',
                description: 'Description du produit A',
                imagepath: '/images/produitA.jpg',
                price: 29.99,
                stock: 100,
                // Le champ 'category' est manquant
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode status a bien été appelée avec 400 (Bad Request)
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a bien été appelé avec un message d'erreur pour 'catégorie manquante'
        expect(res.json).toHaveBeenCalledWith({ error: 'Catégorie manquante' });
    });

    it('devrait retourner une erreur 400 si le chemin de l\'image est manquant', async () => {
        pool.query.mockRejectedValueOnce(new Error("null value in column \"imagepath\" violates not-null constraint"))

        const req = {
            body: {
                name: 'Produit A',
                description: 'Description du produit A',
                // Le champ 'imagepath' est manquant
                price: 29.99,
                stock: 100,
                category: 'Electronics'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la méthode createProduct avec les objets mockés
        await createProduct(req, res);

        // Vérifier que la méthode status a bien été appelée avec 400 (Bad Request)
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que json a bien été appelé avec un message d'erreur pour 'chemin de l\'image manquant'
        expect(res.json).toHaveBeenCalledWith({ error: 'Chemin de l\'image manquant' });
    });

});
describe('getAllProducts', () => {
    it('devrait retourner tous les produits avec succès', async () => {
        const mockProducts = [
            {id: 1, name: 'Produit 1', description: 'Description 1', price: 10, stock: 5, category: 'Catégorie 1'},
            {id: 2, name: 'Produit 2', description: 'Description 2', price: 20, stock: 10, category: 'Catégorie 2'}
        ];

        // Mock de la réponse de la base de données
        pool.query.mockResolvedValueOnce({rows: mockProducts});

        // Création des objets simulés `req` et `res`
        const req = {};
        const res = {
            json: jest.fn(),
        };

        // Appeler la fonction getAllProducts
        await getAllProducts(req, res);

        // Vérifier que `json` a bien été appelé avec les produits mockés
        expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('devrait retourner une erreur si la base de données échoue', async () => {
        // Simuler une erreur de base de données
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la fonction getAllProducts
        await getAllProducts(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que `json` a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({error: 'Erreur de la base de données'});
    });

    it('devrait retourner un tableau vide si aucun produit n\'est trouvé', async () => {
        // Simuler une base de données vide (aucun produit)
        pool.query.mockResolvedValueOnce({rows: []});

        const req = {};
        const res = {
            json: jest.fn()
        };

        // Appeler la fonction getAllProducts
        await getAllProducts(req, res);

        // Vérifier que `json` a bien été appelé avec un tableau vide
        expect(res.json).toHaveBeenCalledWith([]);
    });
});
describe('getProductById', () => {
    it('devrait retourner un produit trouvé avec succès', async () => {
        const mockProduct = {
            id: 1,
            name: 'Produit 1',
            description: 'Description 1',
            price: 10,
            stock: 5,
            category: 'Catégorie 1'
        };

        // Mock de la réponse de la base de données pour un produit spécifique
        pool.query.mockResolvedValueOnce({ rows: [mockProduct] });

        const req = { params: { id: 1 } };
        const res = {
            json: jest.fn(),
        };

        // Appeler la fonction getProductById
        await getProductById(req, res);

        // Vérifier que `json` a bien été appelé avec le produit mocké
        expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('devrait retourner une erreur 404 si le produit n\'est pas trouvé', async () => {
        // Simuler l'absence de produit dans la base de données
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = { params: { id: 999 } }; // Un id qui n'existe pas
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la fonction getProductById
        await getProductById(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que `json` a bien été appelé avec un message d'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Produit non trouvé' });
    });

    it('devrait retourner une erreur 500 en cas d\'erreur dans la requête SQL', async () => {
        // Simuler une erreur de requête SQL
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Appeler la fonction getProductById
        await getProductById(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que `json` a bien été appelé avec l'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });
});

describe('updateProduct', () => {
    it('devrait mettre à jour un produit avec succès', async () => {
        const updatedProduct = {
            id: 1,
            name: 'Produit mis à jour',
            description: 'Description mise à jour',
            imagepath: 'path_to_image',
            price: 20,
            stock: 10,
            category: 'Catégorie mise à jour'
        };

        // Mock de la réponse de la base de données avec un produit mis à jour
        pool.query.mockResolvedValueOnce({ rows: [updatedProduct] });

        const req = {
            params: { id: 1 },
            body: {
                name: 'Produit mis à jour',
                description: 'Description mise à jour',
                imagepath: 'path_to_image',
                price: 20,
                stock: 10,
                category: 'Catégorie mise à jour',
            },
        };
        const res = {
            json: jest.fn(),
        };

        // Appeler la fonction updateProduct
        await updateProduct(req, res);

        // Vérifier que `json` a bien été appelé avec le produit mis à jour
        expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });

    it('devrait retourner une erreur 404 si le produit n\'est pas trouvé', async () => {
        // Simuler l'absence du produit dans la base de données
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = {
            params: { id: 999 },
            body: {
                name: 'Produit mis à jour',
                description: 'Description mise à jour',
                imagepath: 'path_to_image',
                price: 20,
                stock: 10,
                category: 'Catégorie mise à jour',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Appeler la fonction updateProduct
        await updateProduct(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que `json` a bien été appelé avec un message d'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Produit non trouvé' });
    });

    it('devrait retourner une erreur 500 en cas d\'erreur dans la requête SQL', async () => {
        // Simuler une erreur SQL
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = {
            params: { id: 1 },
            body: {
                name: 'Produit mis à jour',
                description: 'Description mise à jour',
                imagepath: 'path_to_image',
                price: 20,
                stock: 10,
                category: 'Catégorie mise à jour',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Appeler la fonction updateProduct
        await updateProduct(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que `json` a bien été appelé avec l'erreur de la base de données
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });

    it('devrait retourner une erreur 400 si les paramètres sont manquants', async () => {
        pool.query.mockRejectedValueOnce(new Error("null value in column \"price\" violates not-null constraint"))
        // Simuler une requête avec des données invalides ou manquantes dans le body
        const req = {
            params: { id: 1 },
            body: {
                name: 'Produit mis à jour',
                description: 'Description mise à jour',
                imagepath: 'path_to_image',
                price: null,  // Price est manquant ou invalide
                stock: 10,
                category: 'Catégorie mise à jour',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Appeler la fonction updateProduct
        await updateProduct(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 400
        expect(res.status).toHaveBeenCalledWith(400);

        // Vérifier que `json` a bien été appelé avec un message d'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Les paramètres sont invalides' });
    });
});

describe('deleteProduct', () => {
    it('devrait supprimer un produit avec succès', async () => {
        const deletedProduct = {
            id: 1,
            name: 'Produit supprimé',
            description: 'Description du produit',
            imagepath: 'path_to_image',
            price: 20,
            stock: 10,
            category: 'Catégorie du produit'
        };

        // Mock de la réponse de la base de données avec le produit supprimé
        pool.query.mockResolvedValueOnce({ rows: [deletedProduct] });

        const req = { params: { id: 1 } };
        const res = {
            json: jest.fn(),
        };

        // Appeler la fonction deleteProduct
        await deleteProduct(req, res);

        // Vérifier que `json` a bien été appelé avec le message de succès et le produit supprimé
        expect(res.json).toHaveBeenCalledWith({ message: 'Produit supprimé', product: deletedProduct });
    });

    it('devrait retourner une erreur 404 si le produit n\'est pas trouvé', async () => {
        // Simuler l'absence du produit dans la base de données
        pool.query.mockResolvedValueOnce({ rows: [] });

        const req = { params: { id: 999 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Appeler la fonction deleteProduct
        await deleteProduct(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 404
        expect(res.status).toHaveBeenCalledWith(404);

        // Vérifier que `json` a bien été appelé avec un message d'erreur
        expect(res.json).toHaveBeenCalledWith({ error: 'Produit non trouvé' });
    });

    it('devrait retourner une erreur 500 en cas d\'erreur dans la requête SQL', async () => {
        // Simuler une erreur SQL
        pool.query.mockRejectedValueOnce(new Error('Erreur de la base de données'));

        const req = { params: { id: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Appeler la fonction deleteProduct
        await deleteProduct(req, res);

        // Vérifier que la méthode `status` a bien été appelée avec 500
        expect(res.status).toHaveBeenCalledWith(500);

        // Vérifier que `json` a bien été appelé avec l'erreur de la base de données
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur de la base de données' });
    });
});
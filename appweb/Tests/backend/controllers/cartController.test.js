const { addToCart, updateCartItem, clearCart,getCart,removeFromCart } = require('../../../src/backend/controllers/cartController');
const pool = require('../../../src/database/db');

jest.mock('../../../src/database/db');

describe('addToCart', () => {
    it('devrait créer un panier et ajouter un produit si l\'utilisateur n\'a pas de panier', async () => {
        const newCart = { id: 1 };
        const cartItem = { cart_id: 1, product_id: 2, quantity: 1 };

        pool.query
            .mockResolvedValueOnce({ rows: [] })  // Aucun panier existant pour l'utilisateur
            .mockResolvedValueOnce({ rows: [newCart] })  // Création du panier
            .mockResolvedValueOnce({ rows: [cartItem] }); // Ajout du produit au panier

        const req = { body: { user_id: 1, product_id: 2, quantity: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(cartItem);
    });

    it('devrait ajouter un produit à un panier existant si l\'utilisateur a déjà un panier', async () => {
        const existingCart = { id: 1 };
        const cartItem = { cart_id: 1, product_id: 2, quantity: 1 };

        pool.query
            .mockResolvedValueOnce({ rows: [existingCart] })  // Panier existant
            .mockResolvedValueOnce({ rows: [cartItem] }); // Ajout du produit

        const req = { body: { user_id: 1, product_id: 2, quantity: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(cartItem);
    });

    it('devrait retourner une erreur si le produit ajouté n\'existe pas', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Panier existant
            .mockRejectedValueOnce(new Error('violates foreign key constraint "cart_items_product_id_fkey"'));

        const req = { body: { user_id: 1, product_id: 999, quantity: 1 } }; // Produit inexistant
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Le produit n\'existe pas' });
    });

    it('devrait retourner une erreur 500 en cas d\'erreur de base de données', async () => {
        pool.query.mockRejectedValueOnce(new Error('Erreur interne'));

        const req = { body: { user_id: 1, product_id: 2, quantity: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await addToCart(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur interne' });
    });
});

describe('getCart', () => {
    it('devrait retourner les articles du panier d\'un utilisateur', async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 1, name: "Produit A", price: 10, quantity: 2 }]
            }); // Récupération des articles du panier

        const req = { params: { userId: 1 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getCart(req, res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Produit A", price: 10, quantity: 2 }]);
    });

    it('devrait retourner une erreur 404 si l\'utilisateur n\'a pas de panier', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] }); // Aucune ligne trouvée = pas de panier

        const req = { params: { userId: 2 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getCart(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Aucun panier trouvé pour cet utilisateur" });
    });


    it('devrait retourner une erreur 500 en cas de problème de base de données', async () => {
        pool.query.mockRejectedValueOnce(new Error("Erreur SQL"));

        const req = { params: { userId: 4 } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await getCart(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Erreur SQL" });
    });
});

describe('updateCartItem', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { cartItemId: 1, quantity: 3 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        pool.query.mockReset();
    });

    it('devrait mettre à jour la quantité d\'un article du panier et retourner l\'article mis à jour', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1, cart_id: 2, product_id: 5, quantity: 3 }],
        });

        await updateCartItem(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [3, 1]
        );
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            cart_id: 2,
            product_id: 5,
            quantity: 3,
        });
    });

    it('devrait retourner une erreur 500 en cas de problème avec la base de données', async () => {
        pool.query.mockRejectedValueOnce(new Error('Erreur DB'));

        await updateCartItem(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [3, 1]
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur DB' });
    });

    it('devrait retourner une erreur 404 si l\'article n\'existe pas', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        await updateCartItem(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [3, 1]
        );
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Article non trouvé' });
    });
    it('devrait retourner une erreur 404 si le panier n\'existe pas', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] }); // Mais le panier n'existe pas

        await updateCartItem(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Panier inexistant' });
    });
});

describe('removeFromCart', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { cartItemId: 1 } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        pool.query.mockReset();
    });

    it('devrait supprimer un article du panier et retourner un message de succès', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Suppression réussie

        await removeFromCart(req, res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Produit supprimé du panier' });
    });

    it('devrait retourner une erreur 404 si l\'article n\'existe pas', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0 }); // Aucun article supprimé

        await removeFromCart(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Article non trouvé' });
    });

    it('devrait retourner une erreur 500 en cas de problème avec la base de données', async () => {
        pool.query.mockRejectedValueOnce(new Error('Erreur DB')); // Erreur simulée

        await removeFromCart(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur DB' });
    });
});

describe('clearCart', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { userId: '1' } };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        pool.query.mockReset();
    });

    it("doit vider le panier de l'utilisateur avec succès", async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        await clearCart(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)',
            ['1']
        );
        expect(res.json).toHaveBeenCalledWith({ message: 'Panier vidé' });
        expect(res.status).not.toHaveBeenCalled();
    });

    it("doit retourner une erreur si l'utilisateur n'a pas de panier", async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0 }); // Aucun panier trouvé

        await clearCart(req, res);

        expect(pool.query).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ message: 'Panier vidé' });
        expect(res.status).not.toHaveBeenCalled();
    });

    it("doit gérer une erreur de base de données", async () => {
        pool.query.mockRejectedValueOnce(new Error('Erreur SQL'));

        await clearCart(req, res);

        expect(pool.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erreur SQL' });
    });
});
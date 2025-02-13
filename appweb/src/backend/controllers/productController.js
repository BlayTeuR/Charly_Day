const {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require('../models/product');

// Créer un produit
const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        if (!name || !price) {
            return res.status(400).json({ message: "Le nom et le prix sont obligatoires." });
        }
        const product = await createProduct({ name, description, price, stock });
        res.status(201).json(product);
    } catch (error) {
        console.error("Erreur lors de la création du produit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Récupérer un produit par son id
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }
        res.json(product);
    } catch (error) {
        console.error("Erreur lors de la récupération du produit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Lister tous les produits
const listProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        console.error("Erreur lors de la récupération de la liste des produits :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Mettre à jour un produit
const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const product = await updateProduct(id, { name, description, price, stock });
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }
        res.json(product);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Supprimer un produit
const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await deleteProduct(id);
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }
        res.json({ message: "Produit supprimé.", product });
    } catch (error) {
        console.error("Erreur lors de la suppression du produit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = {
    addProduct,
    getProduct,
    listProducts,
    updateProductController,
    deleteProductController
};

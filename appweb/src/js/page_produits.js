// Sélection des éléments
const cartIcon = document.getElementById('cartIcon');
const cartPanel = document.getElementById('cartPanel');
const closeCart = document.getElementById('closeCart');

// Ouvrir le menu latéral lors du clic sur l'icône du panier
cartIcon.addEventListener('click', function(e) {
    e.preventDefault();
    cartPanel.classList.remove('translate-x-full');
});

// Fermer le menu latéral lors du clic sur le bouton de fermeture
closeCart.addEventListener('click', function() {
    cartPanel.classList.add('translate-x-full');
});

// (Optionnel) Fermer le menu si l'utilisateur clique en dehors de celui-ci
document.addEventListener('click', function(event) {
    if (!cartPanel.contains(event.target) && !cartIcon.contains(event.target)) {
        cartPanel.classList.add('translate-x-full');
    }
});
document.addEventListener("DOMContentLoaded", function() {
    // URL de l'API pour récupérer les produits
    const apiUrl = '/backoffice/products';

    // Récupérer le conteneur où insérer les produits
    const productList = document.getElementById("product-list");

    // Appel fetch pour récupérer les produits
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors du fetch des produits");
            }
            return response.json();
        })
        .then(products => {
            // Pour chaque produit, créer une "carte" et l'ajouter au conteneur
            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("bg-white", "shadow", "rounded", "p-4");

                // Contenu de la carte avec les informations du produit
                productCard.innerHTML = `
            <h3 class="text-lg font-bold">${product.name}</h3>
            <p class="text-gray-600">${product.description || ""}</p>
            <p class="text-green-600 font-bold">${product.price} €</p>
            <p class="text-gray-500">Stock: ${product.stock}</p>
          `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des produits:", error);
            productList.innerHTML = "<p class='text-red-600'>Impossible de charger les produits.</p>";
        });
});
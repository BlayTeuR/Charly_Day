// index.js

// On attend que le DOM soit complètement chargé
document.addEventListener("DOMContentLoaded", function () {
    // --- Fonctionnalités liées au panier ---
    const cartIcon = document.getElementById("cartIcon");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");
    const successModal = document.getElementById("successModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Ouvrir le menu latéral lors du clic sur l'icône du panier
    cartIcon.addEventListener("click", function (e) {
        e.preventDefault();
        cartPanel.classList.remove("translate-x-full");
    });

    // Fermer le menu latéral lors du clic sur le bouton de fermeture
    closeCart.addEventListener("click", function () {
        cartPanel.classList.add("translate-x-full");
    });

    // Fermer le menu si l'utilisateur clique en dehors du panneau
    document.addEventListener("click", function (event) {
        if (!cartPanel.contains(event.target) && !cartIcon.contains(event.target)) {
            cartPanel.classList.add("translate-x-full");
        }
    });

    // Gestion du modal de succès de commande
    const params = new URLSearchParams(window.location.search);
    if (params.get("commandeSuccess") === "true") {
        successModal.classList.remove("hidden");
    }

    closeModalBtn.addEventListener("click", function () {
        successModal.classList.add("hidden");
        // Optionnel : enlever le paramètre de l'URL
        history.replaceState({}, "", window.location.pathname);
    });

    // --- Récupération et affichage des produits ---
    // On suppose que dans index.html, un conteneur avec l'ID "product-list" existe
    const productListContainer = document.getElementById("product-list");

    if (productListContainer) {
        fetch("/backoffice/products")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des produits");
                }
                return response.json();
            })
            .then((products) => {
                // Pour chaque produit, créer une carte et l'ajouter au conteneur
                products.forEach((product) => {
                    const card = document.createElement("div");
                    card.classList.add("bg-white", "shadow", "rounded", "p-4", "mb-4");
                    card.innerHTML = `
            <h3 class="text-xl font-bold">${product.name}</h3>
            <p class="text-gray-600">${product.description || ""}</p>
            <p class="text-green-600 font-bold">${product.price} €</p>
            <p class="text-gray-500">Stock: ${product.stock}</p>
          `;
                    productListContainer.appendChild(card);
                });
            })
            .catch((error) => {
                console.error("Erreur lors du fetch des produits:", error);
                productListContainer.innerHTML =
                    "<p class='text-red-600'>Impossible de charger les produits.</p>";
            });
    }
});

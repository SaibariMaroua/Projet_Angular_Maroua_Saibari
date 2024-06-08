// cart.model.ts

import { Product } from "./Product";

export class Cart {
  userId: string; // ID de l'utilisateur associé au panier
  products: { product: Product, quantity: number }[]; // Liste des produits dans le panier avec leur quantité

  constructor(userId: string, products: { product: Product, quantity: number }[]) {
    this.userId = userId;
    this.products = products;
  }
}

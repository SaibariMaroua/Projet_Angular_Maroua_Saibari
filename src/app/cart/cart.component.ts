import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { Product } from '../models/Product';
import {FormsModule} from '@angular/forms'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IUser } from '../models/User';
import { UserService } from '../user.service';
import { HeaderComponent } from '../header/header.component';
import { CommandService } from '../services/command.service';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Command } from '../models/Command';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule,HeaderComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{

  private cart: Product[] = [];
  currentUser!: IUser | null; 
    currentUserID: string | null = null;
  users: IUser[] = [];
 // Déclarer la propriété product
  product: Product | undefined;
  address = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '' 
  };
  messageSucces: string = '';


  constructor(private http: HttpClient,private commandService: CommandService, private cartService: CartService ,private router: Router,private userService: UserService) { }
 

  ngOnInit() {
    //this.cart = this.cartService.getCart()
  /*  const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
    } else {
      this.currentUser = null;
    }*/

     // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
     this.currentUserID = this.userService.getCurrentUserId();
console.log(this.currentUserID);

     // Récupérer tous les utilisateurs depuis l'API
     this.userService.getAllUsers().subscribe(users => {
       // Comparer l'ID de chaque utilisateur avec l'ID de l'utilisateur connecté
       this.users = users.filter(user => user._id  === this.currentUserID);

console.log(this.users)
       
     });
   }
  
  

  get cartItems() {
    return this.cart;
  }

  removeFromCart(product: Product) {
    if (!this.currentUserID) {
      console.error("ID de l'utilisateur actuel non défini.");
      return;
    }
  
    this.cartService.removeFromCart(this.currentUserID, product._id)
      .subscribe(
        () => {
          // Supprimer le produit du panier local une fois qu'il a été supprimé du panier côté serveur
          this.cart = this.cart.filter(item => item._id !== product._id);
        },
        (error) => {
          console.error('Erreur lors de la suppression du produit du panier :', error);
          // Gérer les erreurs, par exemple afficher un message à l'utilisateur
        }
      );
  }
  

  getImageUrl(product: Product){
    return '/assets/images/'+ product.imagePath
  }

  // Méthode pour calculer le sous-total
   calculateSubtotal() {
    let subtotal = 0;
    for (let user of this.users) {
      for (let product of user.cart) {
        subtotal += product.price * product.selectedQuantity;
      }
    }
    return subtotal;
  }

  // Fonction pour calculer le total
  calculateTotal() {
    return this.calculateSubtotal(); // Ajout de frais de port fixes par exemple
  }

  

  updateQuantity(productId: string, newQuantity: number) {
    if (!this.currentUserID) {
      console.error("ID de l'utilisateur actuel non défini.");
      return;
    }

    this.cartService.updateSelectedQuantity(this.currentUserID, productId, newQuantity).subscribe(
      response => {
        console.log('Selected quantity updated', response);
        // Optionally, update the local cart to reflect the changes
        const product = this.cart.find(item => item._id === productId);
        if (product) {
          product.selectedQuantity = newQuantity;
        }
      },
      error => {
        console.error('Error updating selected quantity', error);
      }
    );
  }

 /* updateCart(product: Product) {
    if (!this.currentUserID) {
      console.error("ID de l'utilisateur actuel non défini.");
      return;
    }
  
    this.cartService.updateSelectedQuantity(this.currentUserID, product)
      .subscribe(
        () => {
          console.log('Quantité sélectionnée mise à jour avec succès.');
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la quantité sélectionnée :', error);
        }
      );
  }
  */

 // cart.component.ts

 /*passerCommande() {
  const commande = {
    userId: this.currentUserID,
    address: this.address
  };

  this.commandService.passerCommande(commande).subscribe(
    response => {
      console.log('Commande passée avec succès', response);
      this.router.navigate(['/cart']); // Redirection après succès
      this.messageSucces = 'Commande passée avec succès !';
    },
    error => {
      console.error('Erreur lors de la commande :', error);
    }
  );
}*/

passerCommande() {
  const commande = {
    userId: this.currentUserID,
    address: this.address
  };

  this.commandService.passerCommande(commande).subscribe(
    response => {
      console.log('Commande passée avec succès', response);
      this.messageSucces = 'Order placed successfully!';
      this.router.navigate(['/cart']); // Redirection après succès
    },
    error => {
      console.error('Erreur lors de la commande :', error);
      this.messageSucces = 'Order placed successfully!';
    }
  );
}

}
  
  
  


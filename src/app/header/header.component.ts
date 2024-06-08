import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../user.service';
import { IUser } from '../models/User';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../models/Product';
import { ProductService } from '../product.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  user: IUser | null = null;
  showSignOutMenu: boolean = false;
  searchTerm: string = '';
  products: Product[] = [];
  constructor(private http: HttpClient,private userService: UserService,private productService: ProductService , private router: Router) { }

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (user) => { this.user = user }
    })
  }

  toggleSignOutMenu(): void {
    this.showSignOutMenu = !this.showSignOutMenu;
  }

  signOut() {
    this.userService.signOut();
    this.showSignOutMenu = false;
  }

  searchCategory: string = '';
  searchDetails: string = '';
searchProducts(): void {
  // Logique de recherche des produits
  this.router.navigate(['/catalog'], { queryParams: { filter: this.searchCategory, details: this.searchDetails } });
}

addProduct( name: string, title: string, quantity: number, price: number, category: string, details: string, imagePath: string, rating: number) {
  const newProduct = {
    name: name,
    title: title,
    quantity: quantity,
    price: price,
    category: category,
    details: details,
    imagePath: imagePath,
    rating: rating
  };

  this.http.post<any>('http://localhost:3000/api/products', newProduct).subscribe({
    next: () => {
      console.log('Product added successfully');
      // Réinitialiser le formulaire ou effectuer d'autres actions après l'ajout du produit
      this.router.navigate(['/catalog']); 
    },
    error: (error) => {
      console.error('Error adding product:', error);
    }
  });
}

getInitials(firstName: string, lastName: string): string {
  if (!firstName || !lastName) {
    return '';
  }
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

  /*searchProducts(event: Event) {
    event.preventDefault();
    // Filtrer les produits en fonction du terme de recherche
    if (this.searchTerm.trim() !== '') {
      this.products = this.productService.searchProducts(this.searchTerm);
    } else {
      // Si aucun terme de recherche n'est saisi, afficher tous les produits
      this.products = this.productService.getProducts();
    }
  }*/
}

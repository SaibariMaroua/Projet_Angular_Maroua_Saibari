import { Component, Input , EventEmitter, Output } from '@angular/core';
import { Product } from '../models/Product';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink,Router, RouterOutlet,RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { CartService } from '../cart.service';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { SpinnerComponent } from '../spinner/spinner.component';
import { UserService } from '../user.service';
import { catchError, throwError } from 'rxjs';
import { IUser } from '../models/User';
import { HeaderComponent } from '../header/header.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-details-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule,ProductDetailsComponentComponent, SpinnerComponent,
    HttpClientModule,RouterLink,RouterLinkActive,HeaderComponent],
  templateUrl: './product-details-component.component.html',
  styleUrl: './product-details-component.component.css'
})
export class ProductDetailsComponentComponent {
  @Input() product!: Product;

  @Output() buy = new EventEmitter()

  @Input() showDetailsButton: boolean = true;
 showDetails: boolean = false; // Ajout d'une propriété pour suivre l'état d'affichage des détails
 selectedProduct: Product | null = null;
 showDescription: boolean = false;
 user: IUser | null = null;
 products: Product[] = [];

  constructor(private route: ActivatedRoute,private productService : ProductService,private userService: UserService, private cartService: CartService,  private router: Router) { }

  ngOnInit(): void {
    this.getProductDetails();
    this.userService.getUser().subscribe(user => {
      this.user = user;
    });
  }
  toggleDetails() {
    this.showDetails = !this.showDetails; // Inverser l'état d'affichage des détails
  }
 byButtonClicked(product: Product){
    this.buy.emit()

  }
 /* addToCart(){
    this.buy.emit();
    console.log('product added'+ this.product.id)
  }*/

  getProductDetails(): void {
    const productId = this.route.snapshot.paramMap.get('_id');
    if (productId) {
      this.productService.getProductById(productId)
        .subscribe(
          (product: any) => {
            this.product = product;
          },
          (error: any) => {
            console.error('Error fetching product details:', error);
          }
        );
    } else {
      console.error('No product ID provided.');
    }
  }
  toggleDescription(product: Product) {
    // Other logic if any
    this.productService.setSelectedProduct(product);
  }


  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }
  updateSuccessMessage: string = '';
  
  editProduct(): void {
    if (!this.selectedProduct) {
      console.error('No product selected for editing');
      return;
    }
  
    this.productService.updateProduct(this.selectedProduct).subscribe(
      () => {
        console.log('Product updated successfully');
        this.updateSuccessMessage = 'Product updated successfully'; 
        localStorage.setItem('updateSuccessMessage', this.updateSuccessMessage); // Stockez le message dans le stockage local
       // location.reload();
     this.router.navigate(['/catalog']).then(() => {
  window.location.reload();
});


      },
      error => {
        console.error('Error updating product:', error);
        // Gérer l'erreur de mise à jour si nécessaire
      }
    );
  }
  
  
  deleteProduct(product: Product): void {
    console.log('Product ID to delete:', product._id);
  
    Swal.fire({
      title: `Are you sure you want to delete ${product.name}?`,
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product._id).subscribe(
          () => {
            Swal.fire(
              'Deleted!',
              `${product.name} has been deleted successfully.`,
              'success'
            ).then(() => {
              // Actualiser la page après la suppression réussie
              this.router.navigate(['/catalog']);
            });
          },
          error => {
            console.error('Error deleting product:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the product.',
              'error'
            );
          }
        );
      }
    });
  }
  
  addToCart(product: any): void {
    const loggedInUserId = this.userService.getCurrentUserId(); // Obtenez l'ID de l'utilisateur connecté à partir du service UserService
    if (loggedInUserId) {
      this.cartService.addToCart(loggedInUserId, product)
        .subscribe(
          () => {
            console.log('Product added to cart successfully.');
            this.router.navigate(['/cart']);
          },
          (error) => {
            console.error('Error adding product to cart:', error);
          }
        );
    } else {
      console.error('User not logged in.'); // Gérer le cas où l'utilisateur n'est pas connecté
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  };

  rateProduct(product: Product, rating: number): void {
    product.rating = rating;
  }
      // Dans votre composant TypeScript
  scrollToProductDisplay() {
    const productDisplay = document.getElementById('product-display');
    if (productDisplay) {
        productDisplay.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  
}

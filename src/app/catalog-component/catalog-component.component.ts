import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, Input } from '@angular/core';
import { Product } from '../models/Product';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink,Router, RouterOutlet,RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ProductDetailsComponentComponent } from '../product-details-component/product-details-component.component';
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
  selector: 'app-catalog-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule,ProductDetailsComponentComponent, SpinnerComponent,
    HttpClientModule,RouterLink,RouterLinkActive,HeaderComponent],
  templateUrl: './catalog-component.component.html',
  styleUrl: './catalog-component.component.css'
})
export class CatalogComponent{
  /*products: Product[] = [
    new Product(1, 'AER22','Tablette SAM 12 Pouce', 5, 2334, 'Part Type:Tablette SAM 12 Pouce','Plus de détails sur le produit 1', 'assets/tablette12_pouces.webp'),
    new Product(2, 'EFRRR', 'IPhone 14',0, 11000, 'Part Type:IPhone 14', 'Plus de détails sur le produit 2','assets/iphone 14.jpeg'),
    new Product(3, 'SQZEE', 'Smart TV 48 Pouces',3, 8000, 'Part Type: Smart TV 48 Pouces','Plus de détails sur le produit 3', 'assets/smart tv 48 pouces.jpg'),
    new Product(4, 'RTVVV', 'Iphone 14',6, 11000, 'Part Type:Iphone 14', 'Plus de détails sur le produit 4','assets/iphone 14.jpeg'),
    new Product(5, 'Xiaomi Redmi', 'Redmi Note 11',6, 3500, 'Xiaomi Redmi Note 11 GLO Smartphone 4G - Téléphone Portable 128GB 4GB Ram 5000mAh SODIEXP01D ', 'Plus de détails sur le produit 5','assets/redmiNote11.png')
  ];*/
  
  selectedProduct: Product | null = null;
  showDescription: boolean = false;
 
  products: Product[] = [];
  loading:boolean=false;
  user: IUser | null = null;
  pageSize: number = 6; // Nombre de produits par page
  currentPage: number = 1; 

  @Input()
  myValue : string = "";
  filter: string = ""

  constructor(private http: HttpClient,private productService: ProductService,private userService: UserService, private cartService: CartService,  private router: Router,
    private route: ActivatedRoute) { }
    ngOnInit(): void {
      this.loading = true;
      if (typeof localStorage !== 'undefined') {
        this.updateSuccessMessage = localStorage.getItem('updateSuccessMessage') || '';
        localStorage.removeItem('updateSuccessMessage');
      }
     /* this.route.queryParams.subscribe(params => {
        this.filter = params['filter'] || ''; // Obtenez la valeur du paramètre de requête 'filter'
      this.searchDetails = params['details'] || '';
  
        // Appelez la méthode pour récupérer les produits en fonction du filtre
        this.getFilteredProductsss();
      });

      //**************
      this.route.queryParams.subscribe((params)=>{
        this.filter = params['filter'] ?? '';
         })
       //
      this.loadProducts();*/
      this.productService.getProductsList().subscribe(products =>{
        this.products=products
             })
         console.log('child onit called')


       this.route.queryParams.subscribe((params)=>{
        this.filter = params['filter'] ?? '';
         })

       console.log("child OnInit is called ")



         this.route.queryParams.subscribe(params => {
           this.searchCategory = params['filter'] || ''; // Catégorie de recherche
           this.searchDetails = params['details'] || ''; // Détails de recherche
           this.getFilteredProductsss();
         });

         this.userService.getUser().subscribe(user => {
          this.user = user;
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
  
  getAvailableProducts(): Product[] {
      return this.productService.getAvailableProducts();
    }
  
    isLowStock(quantity: number): boolean {
      return this.productService.isLowStock(quantity);
    }
    toggleDescription(product: Product): void {
      this.productService.toggleDescription(product);
     }

     searchDetails: string = '';
     getFilteredProducts(): void {
      this.loading = true;
      this.productService.getProductsList().subscribe(products => {

        if (!this.filter && !this.searchDetails) {
          this.products = products; // Si aucun filtre n'est spécifié, obtenir tous les produits

        } else {
          this.loading = true;
          // Sinon, filtrer les produits localement par catégorie ou détails du produit
          this.products = products.filter(product =>
            (this.filter ? product.category === this.filter : true) && // Filtrer par catégorie si spécifiée
            (this.searchDetails ? this.searchDetailsMatches(product.details, this.searchDetails) : true) // Filtrer par détails du produit si spécifiés
          );
        }
        setTimeout(() => {
          this.loading = false; // Définir loading sur false après un délai de 2 secondes
        }, 1000);
      });
    }
    
   /* searchDetailsMatches(details: string, searchTerm: string): boolean {
      this.loading = true;
      // Convertir les détails et le terme de recherche en minuscules pour une comparaison insensible à la casse
      details = details.toLowerCase();
      searchTerm = searchTerm.toLowerCase();
    
      // Vérifier si les détails contiennent le terme de recherche
      return details.includes(searchTerm);
    }
    rateProduct(product: Product, rating: number): void {
      product.rating = rating;
    }
*/
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

 liked: boolean = false;
// Dans votre composant TypeScript le coueur 
toggleLike(product: any) {
  product.liked = !product.liked;
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
            window.location.reload();
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


/*deleteProduct(product: Product): void {

  console.log('Product ID to delete:', product._id);
  // Demander une confirmation à l'utilisateur
  const confirmDelete = confirm(`Are you sure you want to delete ${product.name} ?`);


  // Si l'utilisateur confirme la suppression
  if (confirmDelete) {
    // Appeler le service pour supprimer le produit
    this.productService.deleteProduct(product._id).subscribe(
      () => {
        // Rafraîchir la liste des produits après la suppression réussie
        this.loadProducts();
      },
      error => {
        // Gérer l'erreur et afficher un message d'erreur à l'utilisateur
        console.error('Error deleting product:', error);
        // Afficher un message d'erreur à l'utilisateur
        // Vous pouvez utiliser un service de toaster ou une boîte de dialogue d'alerte pour afficher le message d'erreur
        alert('An error occurred while deleting the product.');
      }
    );
  }
}*/


loadProducts(): void {
  this.productService.getProducts().subscribe(products => {
    this.products = products;
  });
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
      window.location.reload();
    },
    error => {
      console.error('Error updating product:', error);
      // Gérer l'erreur de mise à jour si nécessaire
    }
  );
}













searchCategory: string = ''; // Catégorie de recherche
  //searchDetails: string = '';
getFilteredProductsss(): void {
  this.loading = true;
  this.productService.getProductsList().subscribe(products => {
    if (!this.searchCategory && !this.searchDetails) {
      this.products = products; // Si aucun filtre n'est spécifié, obtenir tous les produits
    } else {
      this.loading = true;
      this.products = products.filter(product =>
        (!this.searchCategory || product.category === this.searchCategory) && // Filtrer par catégorie si spécifiée
        (!this.searchDetails || this.searchDetailsMatches(product.details, this.searchDetails)) // Filtrer par détails du produit si spécifiés
      );
    }
    setTimeout(() => {
      this.loading = false; // Définir loading sur false après un délai de 2 secondes
    }, 1000);
  });
 
}

searchDetailsMatches(details: string, searchTerm: string): boolean {
  details = details.toLowerCase();
  searchTerm = searchTerm.toLowerCase();
  return details.includes(searchTerm);
}

// Appliquer le filtre lorsque le bouton de recherche est cliqué
applyFilter(): void {
  this.router.navigate(['/catalog'], { queryParams: { filter: this.searchCategory, details: this.searchDetails } });
}

// Appliquer le filtre par catégorie lorsqu'un bouton est cliqué
applyCategoryFilter(category: string): void {
  this.searchCategory = category;
  this.applyFilter(); // Appliquer le filtre avec la nouvelle catégorie sélectionnée
}



viewProductDetails(product: Product) {
  // Vous pouvez passer l'ID du produit en tant que paramètre de route
  this.router.navigate(['/product', product._id]);
}

getPaginatedProducts(): Product[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = Math.min(startIndex + this.pageSize, this.products.length);
  return this.products.slice(startIndex, endIndex);
}

// Méthode pour passer à la page précédente
previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

// Méthode pour passer à la page suivante
nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

// Propriété calculée pour obtenir le nombre total de pages
get totalPages(): number {
  return Math.ceil(this.products.length / this.pageSize);
}
}
  

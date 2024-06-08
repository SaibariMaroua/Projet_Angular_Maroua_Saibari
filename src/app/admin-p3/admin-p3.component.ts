import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductDetailsComponentComponent } from '../product-details-component/product-details-component.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ProductService } from '../product.service';
import { Product } from '../models/Product';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { IUser, User } from '../models/User';
import { UserService } from '../user.service';
import { CommandService } from '../services/command.service';
declare var $: any;

@Component({
  selector: 'app-admin-p3',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule,ProductDetailsComponentComponent, SpinnerComponent,
    HttpClientModule,RouterLink,RouterLinkActive],
  templateUrl: './admin-p3.component.html',
  styleUrl: './admin-p3.component.css'
})
export class AdminP3Component {
  products: any[] = [];
  user: IUser | null = null;
  selectedProduct: Product | null = null;
showDataTable: boolean = false;
  showSignOutMenu: boolean = false;
  users: any[] = [];
  selectedUser: any; 
  numberOfNonAdminUsers !: number;
  numberOfProducts !:number;

  constructor(private commandService: CommandService,private productService: ProductService,private userService: UserService,private http: HttpClient,private router: Router,private cdr: ChangeDetectorRef) {} // Injectez le service ProductService

   ngOnInit(): void {
    this.productService.getProductsList().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.numberOfProducts = this.products.length;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
    this.loadProducts();
    this.userService.getUser().subscribe({
      next: (user) => { this.user = user }
    });
    this.loadUsers();

this.userService.getUsers().subscribe(users => {
  this.users = users;
  // Filtrer les utilisateurs qui ne sont pas des admins
  const nonAdminUsers = this.users.filter(user => user.userType !== 'Admin');
  // Calculer le nombre d'utilisateurs sans userType Admin
  this.numberOfNonAdminUsers = nonAdminUsers.length;
});
this.loadCommandes();
    
  }


  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users: any[]) => {
        this.users = users;
        // Vous pouvez également forcer le rafraîchissement de la vue en appelant detectChanges
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  selectUser(user: any): void {
    this.selectedUser = user;
  }

  userToDelete!: User;
  confirmDelete(user: User): void {
    // Stocker l'utilisateur à supprimer dans une variable temporaire
    this.userToDelete = user;
    // Afficher la modal de confirmation
    $('#exampleModal').modal('show');
  }
  numberOfUsers:number=0;
  deleteConfirmed(user: User): void {
    // Appeler votre méthode deleteUser pour supprimer l'utilisateur
    this.userService.deleteUser(user._id).subscribe(
      () => {
        // Supprimer l'utilisateur de la liste après la suppression réussie
        this.users = this.users.filter(u => u._id !== user._id);
        this.numberOfUsers = this.users.length;
        // Actualiser la page
        window.location.reload();
      },
      error => {
        console.error('Erreur lors de la suppression de l\'utilisateur : ', error);
        // En cas d'erreur, actualiser également la page pour afficher les données actuelles
        window.location.reload();
      }
    );
    // Fermer la modal de confirmation après la suppression
    $('#exampleModal').modal('hide');
  }
  

 

/*  deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe(
      () => {
        // Suppression réussie, mettre à jour la liste des produits
        this.products = this.products.filter(product => product.id !== id);
      },
      (error) => {
        console.error('Error deleting product:', error);
      }
    );
  }
*/
  selectProduct(product: Product): void {
    this.selectedProduct = product;
  }
  updateSuccessMessage: string = '';
  
  //modification des produits
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
        location.reload();
      },
      error => {
        console.error('Error updating product:', error);
        // Gérer l'erreur de mise à jour si nécessaire
      }
    );
  }
  
//suppression des  produits
 // Méthode pour charger les produits
 loadProducts(): void {
  this.productService.getProducts().subscribe(
    data => {
      this.products = data;
    },
    error => {
      console.error('Error loading products:', error);
      alert('An error occurred while loading the products.');
    }
  );
}



deleteProduct(product: Product): void {
  console.log('Product ID to delete:', product._id);

  swal.fire({
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



signOut() {
  this.userService.signOut();
  this.showSignOutMenu = false;
}



  ngAfterViewInit(): void {
    this.initializeDataTable();
  }
  private initializeDataTable(): void {
    $(function () {
      $("#example1").DataTable({
        "responsive": true,
        "lengthChange": false,
        "autoWidth": false,
        "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"],
        "paging": true, // Activer la pagination
      "pageLength": 3
      }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');

      $('#example2').DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": true,
        "info": true,
        "autoWidth": false,
        "responsive": true,
      });
    });
  }



  navigateAndReload() {
    this.router.navigateByUrl('/adminP2').then(() => {
      window.location.reload();
    });
  }



  numberOfOrders !:number;
  commandes: any[] = [];
  loadCommandes() {
    this.commandService.getCommandes().subscribe(
      data => {
        this.commandes = data;
        this.numberOfOrders = this.commandes.length;
      },
      error => {
        console.error('Erreur lors de la récupération des commandes :', error);
      }
    );
  }
}


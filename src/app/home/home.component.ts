import { Component, Input } from '@angular/core';
import { RouterLink,Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { IUser } from '../models/User';
import { UserService } from '../user.service';
import { Product } from '../models/Product';
import { ProductService } from '../product.service';
import { CartService } from '../cart.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink , CommonModule,HeaderComponent, RouterOutlet,SpinnerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentPage: number = 1;
  totalPages: number = 3; // Remplacez par le nombre total de pages
  user: IUser | null = null;
  @Input() product!: Product;
  currentIndex: number = 0;
  intervalId: any;
  products: Product[] = [];
  constructor(private userService: UserService,private productService: ProductService, private cartService: CartService) {}

  ngOnInit() {
    
    this.userService.getUser().subscribe(user => {
      //console.log('Données utilisateur reçues de l\'API :', user);
      this.user = user;
    });
       this.userService.getUser().subscribe({
      next: (user) => { this.user = user }
    });
    this.loadProducts();
   // this.startAutoScroll();
  }


  prevSlide() {
    this.currentIndex = (this.currentIndex === 0) ? this.products.length - 1 : this.currentIndex - 1;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex === this.products.length - 1) ? 0 : this.currentIndex + 1;
  }

  startAutoScroll() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000); // Change d'image toutes les 3 secondes
  }

  stopAutoScroll() {
    clearInterval(this.intervalId); // Arrête le défilement automatique
  }
  ngOnDestroy() {
    this.stopAutoScroll(); // Arrête le défilement automatique lors de la destruction du composant
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      
    });
  }
  getFilteredProducts() {
    return this.products.filter(product => product.quantity < 5);
  }


 /* ngAfterViewInit(): void {
    if (this.products.length > 0) {
      this.startAutoScroll();
    }

  }*/
  

  showFullDetails: boolean = false;
  previewLength: number = 100;
  toggleFullDetails() {
    this.showFullDetails = !this.showFullDetails;
  }


  parts: string[] = ['phone', 'tablet', 'smarttv' , 'camera' ,'watch', 'headphone'];
  imageUrls: { [key: string]: { url: string, title: string } } = {
    phone: { url: '/assets/images/phones.jpg', title: 'Smart Phone' },
    tablet: { url: '/assets/images/tablet.webp', title: 'Tablet' },
    smarttv: { url: '/assets/images/smartTV.png', title: 'Smart TV' },
    camera: { url: '/assets/images/cameraHome.png', title: 'Camera' },
    watch: { url: '/assets/images/watchHome.jpg', title: 'Watch' },
    headphone: { url: '/assets/images/headphoneHome.jpg', title: 'HeadPhones' }
  };
 

  nextPart() {
    this.currentIndex = (this.currentIndex + 1) % this.parts.length;
  }

  prevPart() {
    this.currentIndex = (this.currentIndex - 1 + this.parts.length) % this.parts.length;
  }
}
  



import { Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component'; // Utilisez 'SigninComponent' au lieu de 'SignInComponent'

import { CatalogComponent } from './catalog-component/catalog-component.component';
import { CartComponent } from './cart/cart.component';
import { HomeComponent } from './home/home.component';
import { ProductDetailsComponentComponent } from './product-details-component/product-details-component.component';
import { AdminComponent } from './admin/admin.component';
import { AdminP2Component } from './admin-p2/admin-p2.component';
import { AdminP3Component } from './admin-p3/admin-p3.component';
import { ProfileClientComponent } from './profile-client/profile-client.component';
import { AdminP4Component } from './admin-p4/admin-p4.component';

export const routes: Routes = [
  {path : 'home', component : HomeComponent, title: 'My Home'},
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirection vers la page du catalogue par défaut
  { path: 'signin', component: SigninComponent,title: 'Signin' }, // Route pour la page de connexion
  { path: 'catalog', component: CatalogComponent } ,// Route pour la page du catalogue
  {path : 'cart', component : CartComponent, title: 'My cart'},
  {path : 'product-details', component : ProductDetailsComponentComponent, title: 'Product details'},
  {path : 'admin', component : AdminComponent},
  { path: 'adminP2', component: AdminP2Component },
  { path: 'adminP3', component:AdminP3Component},
  { path: 'adminP4', component:AdminP4Component},
  { path: 'profile', component:ProfileClientComponent},
  { path: 'product/:_id', component: ProductDetailsComponentComponent },
];

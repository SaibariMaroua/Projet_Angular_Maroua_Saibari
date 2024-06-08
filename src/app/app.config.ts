import { FormsModule } from '@angular/forms'; // Importez FormsModule depuis @angular/forms

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { ProductService } from './product.service';
import { UserService } from './user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    CartService,
    ProductService,
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    UserService,
    FormsModule // Ajoutez FormsModule aux fournisseurs pour activer la liaison bidirectionnelle (ngModel)
  ]
};

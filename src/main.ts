/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CatalogComponent } from './app/catalog-component/catalog-component.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

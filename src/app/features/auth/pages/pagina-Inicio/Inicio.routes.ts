// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const INICIO_ROUTES: Routes = [
  {
    path: 'inicio',
    loadComponent: () =>
      import('./inicio/inicio.component').then(m => m.InicioComponent)
  }
];

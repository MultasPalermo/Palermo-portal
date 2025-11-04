// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const HOMEPASSWORD_ROUTES: Routes = [
  {
    path: 'contenido',
    loadComponent: () =>
      import('./contenido-password/contenido-inicio.component').then(m => m.ContenidoInicioComponent)
  }
];

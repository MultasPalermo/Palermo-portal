// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const IDENTIFICACION_ROUTES: Routes = [
  {
    path: 'identificacion',
    loadComponent: () =>
      import('./identificacion.component').then(m => m.Identificacion)
  }
];
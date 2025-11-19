// src/app/features/seguimiento/seguimiento.routes.ts
import { Routes } from '@angular/router';
export const SEGUIMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/seguimiento.component').then(m => m.SeguimientoComponent)
  }
];

// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile.component').then(m => m.ProfileComponent)
  }
];

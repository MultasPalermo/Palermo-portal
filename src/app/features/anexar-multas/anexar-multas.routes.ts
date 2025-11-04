// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const ANEXAR_MULTAS_ROUTES: Routes = [
  {
    path: 'multas',
    loadComponent: () =>
      import('./pages/anexar-multas/anexar-multas.component').then(m => m.AnexarMultasComponent)
  }
];

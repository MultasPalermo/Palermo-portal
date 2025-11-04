import { Routes } from '@angular/router';

export const MODULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/module-page/module-page.component').then(c => c.ModulePageComponent),
  }
];
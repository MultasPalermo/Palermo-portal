import { Routes } from '@angular/router';

export const FORM_MODULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/form-module-page/form-module-page.component').then(c => c.FormModulePageComponent),
  }
];
import { Routes } from '@angular/router';

export const FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/form-page/form-page.component').then(c => c.FormPageComponent),
  }
];
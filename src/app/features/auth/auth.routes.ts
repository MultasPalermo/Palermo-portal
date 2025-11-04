// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  { path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.Login)
  },
  { path: 'registrar',
    loadComponent: () =>
      import('./pages/register/register.component')
        .then(m => m.Registrar)
  },
  { path: 'verify-code',
    loadComponent: () =>
      import('./pages/verify-code/verify-code.component')
        .then(m => m.VerifyCodeComponent)
  },
  { path: 'access-denied',
    loadComponent: () =>
      import('./pages/access-denied/access-denied.component')
        .then(m => m.Access)
  },
  { path: 'error',
    loadComponent: () =>
      import('./pages/error/error.component')
        .then(m => m.Error)
  },
    {
    path: 'inicio',
    loadComponent: () =>
      import('../auth/pages/inicio/inicio.component').then(m => m.InicioComponent)
  },
    {
    path: 'verify-email',
    loadComponent: () =>
      import('../auth/pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  }
];

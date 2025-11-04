// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const DOCUMENT_ROUTES: Routes = [
  {
    path: 'document',
    loadComponent: () =>
      import('./contenido-documento/contenido-documento.component').then(m => m.ContenidoDocumentoComponent)
  }
];

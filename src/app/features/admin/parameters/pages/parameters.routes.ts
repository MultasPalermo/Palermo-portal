// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const PARAMETERS_ROUTES: Routes = [
  {
    path: 'department',
    loadComponent: () =>
      import('../pages/department/department.component').then(m => m.DepartmentComponent)
  },
  {
    path: 'document-type',
    loadComponent: () =>
      import('../pages/document-type/document-type.component').then(m => m.DocumentTypeComponent)
  },
  {
    path: 'municipality',
    loadComponent: () =>
      import('../pages/municipality/municipality.component').then(m => m.MunicipalityComponent)
  },
  {
    path: 'payment-frequency',
    loadComponent: () =>
      import('../pages/payment-frequency/payment-frequency.component').then(m => m.PaymentFrequencyComponent)
  },
   {
    path: 'smdlv',
    loadComponent: () =>
      import('../pages/smdlv/smdlv/smdlv.component').then(m => m.SmdlvComponent)
  }
];

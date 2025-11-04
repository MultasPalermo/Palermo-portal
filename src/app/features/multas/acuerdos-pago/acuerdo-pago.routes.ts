// src/app/features/acuerdo-pago/acuerdo-pago.routes.ts
import { Routes } from '@angular/router';
export const ACUERDO_PAGO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'formulario' },
  { path: 'formulario', loadComponent: () => import('./pages/formulario-acuerdo-pago/formulario-acuerdo-pago.component').then(m => m.FormularioAcuerdoPagoComponent) },
  { path: 'generado-ok', loadComponent: () => import('./pages/generado-ok/agreement-success.component').then(m => m.AgreementSuccessComponent) },
  // { path: 'cuotas-pagar', loadComponent: () => import('./pages/cuotas/cuotas.component').then(m => m.CuotasComponent) }
];

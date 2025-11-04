// src/app/features/notificacion-multas/notificacion-multas.routes.ts
import { Routes } from '@angular/router';
export const NOTIFICACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/components/encabezado/notificacion/notificacion.component').then(m => m.NotificacionComponent)
  },
   {
    path: 'notificacion-multas',
    loadComponent: () =>
      import('./components/notification-anexo-multas/encabezado/notification-multas/notification-multas.component').then(m => m.NotificationMultasComponent)
  }
];

// src/app/features/home/home.routes.ts
import { Routes } from '@angular/router';
export const CALENDARIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/calendar/calendar.component').then(m => m.CalendarComponent)
  }
];

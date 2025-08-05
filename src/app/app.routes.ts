import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'reservation',
    loadComponent: () => import('./components/reservation-form/reservation-form.component').then(m => m.ReservationFormComponent)
  }
];

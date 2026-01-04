import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    title: 'Dashboard | UK Energy Grid',
  },
  {
    path: 'historical',
    loadComponent: () =>
      import('@features/historical/historical.component').then(
        (m) => m.HistoricalComponent
      ),
    title: 'Historical | UK Energy Grid',
  },
  {
    path: 'regional',
    loadComponent: () =>
      import('@features/regional/regional.component').then(
        (m) => m.RegionalComponent
      ),
    title: 'Regional | UK Energy Grid',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@features/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    title: 'Settings | UK Energy Grid',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

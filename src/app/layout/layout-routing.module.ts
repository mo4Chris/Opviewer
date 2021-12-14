import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)},
            { path: 'clients', loadChildren: () => import('./clients/client-overview.module').then(m => m.ClientOverviewModule)},
            { path: 'forecast', loadChildren: () => import('./forecast/forecast.module').then(m => m.ForecastModule)},
            { path: 'campaigns', loadChildren: () => import('./TWA/fleets/fleets.module').then(m => m.FleetsModule) },
            { path: 'fleet-log', loadChildren: () => import('./TWA/fleet-log/fleet-log.module').then(m => m.FleetLogModule) },
            { path: 'campaign-request', loadChildren: () => import('./TWA/fleet-request/fleet-request.module').then(m => m.FleetRequestModule) },
            { path: 'fleetavailability', loadChildren: () => import('./TWA/fleetavailability/fleetavailability.module').then(m => m.FleetavailabilityModule) },
            { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
            { path: 'user-settings', loadChildren: () => import('./user-settings/user-settings.module').then(m => m.UserSettingsModule) },
            { path: 'usermanagement', loadChildren: () => import('./usermanagement/usermanagement.module').then(m => m.UserManagementModule) },
            { path: 'access-denied', loadChildren: () => import('./access-denied/access-denied.module').then(m => m.AccessDeniedModule) },
            { path: 'not-found', loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) }
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
})
export class LayoutRoutingModule {}

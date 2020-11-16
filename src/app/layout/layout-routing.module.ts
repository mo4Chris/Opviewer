import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { ReportsModule } from './reports/reports.module';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            { path: 'reports', loadChildren: './reports/reports.module#ReportsModule'},
            { path: 'campaigns', loadChildren: './TWA/fleets/fleets.module#FleetsModule' },
            { path: 'fleet-log', loadChildren: './TWA/fleet-log/fleet-log.module#FleetLogModule' },
            { path: 'campaign-request', loadChildren: './TWA/fleet-request/fleet-request.module#FleetRequestModule' },
            { path: 'fleetavailability', loadChildren: './TWA/fleetavailability/fleetavailability.module#FleetavailabilityModule' },
            { path: 'users', loadChildren: './users/users.module#UsersModule' },
            { path: 'user-settings', loadChildren: './user-settings/user-settings.module#UserSettingsModule' },
            { path: 'usermanagement', loadChildren: './usermanagement/usermanagement.module#UserManagementModule' },
            { path: 'access-denied', loadChildren: './access-denied/access-denied.module#AccessDeniedModule' },
            { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' }
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

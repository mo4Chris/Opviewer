import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard' },
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
            { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
            { path: 'vesselsandreports', loadChildren: './tables/tables.module#TablesModule' },
            { path: 'forms', loadChildren: './form/form.module#FormModule' },
            { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
            { path: 'grid', loadChildren: './grid/grid.module#GridModule' },
            { path: 'vesselreport', loadChildren: './vesselreport/vesselreport.module#VesselreportModule' },
            { path: 'fleets', loadChildren: './fleets/fleets.module#FleetsModule' },
            { path: 'fleet-log', loadChildren: './fleet-log/fleet-log.module#FleetLogModule' },
            { path: 'fleetavailability', loadChildren: './fleetavailability/fleetavailability.module#FleetavailabilityModule' },
            { path: 'scatterplot', loadChildren: './scatterplot/scatterplot.module#ScatterplotModule' },
            { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
            { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
            { path: 'users', loadChildren: './users/users.module#UsersModule' },
            { path: 'usermanagement', loadChildren: './usermanagement/usermanagement.module#UserManagementModule' },
            { path: 'access-denied', loadChildren: './access-denied/access-denied.module#AccessDeniedModule' },
            { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}

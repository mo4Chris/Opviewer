import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FleetavailabilityComponent } from './fleetavailability.component';
import { CanDeactivateGuard } from '../../../can-deactivate.guard';

const routes: Routes = [
    {
        path: '', component: FleetavailabilityComponent, canDeactivate: [CanDeactivateGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FleetavailabilityRoutingModule {
}

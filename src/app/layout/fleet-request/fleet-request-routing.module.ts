import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FleetRequestComponent } from './fleet-request.component';

const routes: Routes = [
    {
        path: '', component: FleetRequestComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FleetRequestRoutingModule {
}

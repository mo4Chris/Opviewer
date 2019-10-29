import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FleetLogComponent } from './fleet-log.component';

const routes: Routes = [
    {
        path: '', component: FleetLogComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FleetLogRoutingModule {
}

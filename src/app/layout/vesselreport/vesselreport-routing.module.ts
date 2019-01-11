import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VesselreportComponent } from './vesselreport.component';


const routes: Routes = [
    {
        path: '', component: VesselreportComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VesselreportRoutingModule {
}

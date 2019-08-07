import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TablesComponent } from './tables.component';
import { VesselreportComponent } from '../vesselreport/vesselreport.component';
import { LongtermComponent } from '../longterm/longterm.component';

const routes: Routes = [
    {
        path: '', component: TablesComponent
    },{
        path: 'vesselreport/:mmsi', component: VesselreportComponent 
    },{
        path: 'scatterplot/:mmsi', component: LongtermComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TablesRoutingModule {
}

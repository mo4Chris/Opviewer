import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TablesComponent } from './tables.component';
import { VesselreportComponent } from '../reports/vesselreport/vesselreport.component';
import { LongtermComponent } from '../reports/longterm/longterm.component';
import { ReportsComponent } from '../reports/reports.component';
import { ReportsModule } from '../reports/reports.module';
import { LongtermModule } from '../reports/longterm/longterm.module';

const routes: Routes = [
    {
        path: '', component: TablesComponent
    }, {
        path: 'reports', component: ReportsComponent
    }, {
        path: 'vesselreport/:mmsi', component: VesselreportComponent
    }, {
        path: 'longterm/:mmsi', component: LongtermComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        ReportsModule,
        LongtermModule
    ],
    exports: [RouterModule]
})
export class TablesRoutingModule {
}

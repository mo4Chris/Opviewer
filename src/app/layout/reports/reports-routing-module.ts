import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LongtermComponent } from './longterm/longterm.component';
import { SOVSiemensMonthlyKPIComponent } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.component';
import { ReportsDprComponent } from './dpr/reports-dpr.component';

const routes: Routes = [
    {
        path: '', component: ReportsComponent
    }, {
        path: 'reports-dpr', component: ReportsDprComponent
    }, {
        path: 'reports-dpr/:mmsi', component: ReportsDprComponent
    }, {
        path: 'longterm/:mmsi', component: LongtermComponent
    }, {
        path: 'longterm', component: LongtermComponent
    }, {
        path: 'siemens-kpi', component: SOVSiemensMonthlyKPIComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}

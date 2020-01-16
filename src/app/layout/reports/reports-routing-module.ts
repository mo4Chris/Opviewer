import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LongtermComponent } from './longterm/longterm.component';
import { SOVSiemensMonthlyKPIComponent } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.component';
import { ReportsDprComponent } from './dpr/reports-dpr.component';
import { TablesComponent } from './tables/tables.component';

const routes: Routes = [
    { path: '', component: ReportsComponent },
    { path: 'dpr', component: ReportsComponent },
    { path: 'longterm', component: ReportsComponent },
    { path: 'tables', component: ReportsComponent },
    { path: '**', component: ReportsComponent },
];

// const subroutes: Routes = [
//     { path: 'dpr', component: ReportsDprComponent, outlet: 'reports' }, // dpr/:mmsi did not work, not sure why
//     { path: 'tables', component: TablesComponent, outlet: 'reports' },
//     { path: 'longterm/:mmsi', component: LongtermComponent, outlet: 'reports' },
//     { path: 'longterm', component: LongtermComponent, outlet: 'reports' },
//     { path: 'siemens-kpi', component: SOVSiemensMonthlyKPIComponent, outlet: 'reports' },
// ];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        // RouterModule.forRoot(subroutes),
    ],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}

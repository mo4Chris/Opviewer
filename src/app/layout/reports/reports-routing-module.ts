import { ReportsComponent } from './reports.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LongtermComponent } from './longterm/longterm.component';
import { SOVSiemensMonthlyKPIComponent } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.component';
import { ReportsDprComponent } from './dpr/reports-dpr.component';
import { TablesComponent } from './tables/tables.component';

const routes: Routes = [
    { path: '', component: TablesComponent },
    { path: 'dpr', component: ReportsDprComponent }, // dpr/:mmsi did not work, not sure why
    { path: 'tables', component: TablesComponent },
    { path: 'longterm/:mmsi', component: LongtermComponent },
    { path: 'longterm', component: LongtermComponent },
    { path: 'siemens-kpi', component: SOVSiemensMonthlyKPIComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}

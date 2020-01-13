import { ReportsComponent } from "./reports.component";
import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { LongtermComponent } from "./longterm/longterm.component";
import { SOVSiemensMonthlyKPIComponent } from "./sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.component";
import { ReportDprComponent } from "./dpr/report-dpr.component";

const routes: Routes = [
    {
        path: '/reports', component: ReportsComponent
    }, {
        path: '/report-dpr', component: ReportDprComponent
    }, {
        path: '/report-dpr/:mmsi', component: ReportDprComponent
    }, {
        path: '/longterm/:mmsi', component: LongtermComponent
    }, {
        path: '/longterm', component: LongtermComponent
    }, {
        path: '/siemens-kpi', component: SOVSiemensMonthlyKPIComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}

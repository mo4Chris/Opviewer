import { CommonService } from '../../common.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports-routing-module'
import { ReportDprComponent } from './dpr/report-dpr.component';
import { ReportDprModule } from './dpr/report-dpr.module';
import { LongtermModule } from './longterm/longterm.module';
import { SovSiemensMojnthlyKpiModule } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.module';

// const routes = [
//     {
//         path: 'reports',
//         component: ReportsComponent,
//         children: [
//             { path: 'vesselreport', loadChildren: './vesselreport/vesselreport.module#VesselreportModule' },
//             { path: 'longterm', loadChildren: './longterm/longterm.module#LongtermModule' },
//         ]
//     },
// ];

@NgModule({
    imports: [
        CommonModule,
        ReportsRoutingModule,
        ReportDprModule,
        LongtermModule,
        SovSiemensMojnthlyKpiModule
        // RouterModule.forChild(routes),
        // VesselreportModule,
        // ReportsComponent
    ],
    exports: [RouterModule],
    providers: [CommonService, ReportsComponent, ReportDprComponent],
    declarations: [ReportsComponent],
    bootstrap: [ReportsComponent],
})
export class ReportsModule {}

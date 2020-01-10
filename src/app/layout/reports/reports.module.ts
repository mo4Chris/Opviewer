import { CommonService } from '../../common.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule } from '@angular/router';
import { VesselreportModule } from './vesselreport/vesselreport.module';
import { VesselreportComponent } from './vesselreport/vesselreport.component';

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
        // RouterModule.forChild(routes),
        VesselreportModule,
    ],
    exports: [RouterModule],
    providers: [CommonService, ReportsComponent],
    declarations: [ReportsComponent],
    bootstrap: [ReportsComponent],
})
export class ReportsModule {}

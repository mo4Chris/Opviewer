import { CommonService } from '../../common.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports-routing-module';
import { ReportsDprComponent } from './dpr/reports-dpr.component';
import { ReportsDprModule } from './dpr/reports-dpr.module';
import { LongtermModule } from './longterm/longterm.module';
import { SovSiemensMojnthlyKpiModule } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.module';
import { TablesComponent } from './tables/tables.component';
import { TablesModule } from './tables/tables.module';

@NgModule({
    imports: [
        CommonModule,
        ReportsRoutingModule,
        ReportsDprModule,
        LongtermModule,
        SovSiemensMojnthlyKpiModule,
        TablesModule
    ],
    exports: [RouterModule],
    providers: [CommonService, ReportsComponent, ReportsDprComponent],
    declarations: [ReportsComponent],
    bootstrap: [ReportsComponent],
})
export class ReportsModule {}

import { CommonService } from '../../common.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports-routing-module';
import { ReportsDprModule } from './dpr/reports-dpr.module';
import { LongtermModule } from './longterm/longterm.module';
import { SovSiemensMonthlyKpiModule } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.module';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@app/shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { TablesModule } from './tables/tables.module';
// import { TablesModule } from './tables/tables.module';

@NgModule({
    imports: [
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        CommonModule,
        FormsModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule,

        ReportsRoutingModule,
        ReportsDprModule,
        LongtermModule,
        SovSiemensMonthlyKpiModule,
        TablesModule,
    ],
    exports: [RouterModule],
    providers: [CommonService],
    declarations: [ReportsComponent],
    bootstrap: [ReportsComponent],
})
export class ReportsModule {}

import { CommonService } from '../../common.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule } from '@angular/router';
import { ReportsRoutingModule } from './reports-routing-module';
import { ReportsDprModule } from './dpr/reports-dpr.module';
import { LongtermModule } from './longterm/longterm.module';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@app/shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { TablesModule } from './tables/tables.module';
import { environment } from 'environments/environment';

@NgModule({
    imports: [
        AgmCoreModule.forRoot({
            apiKey: environment.GOOGLE_API_KEY
        }),
        CommonModule,
        FormsModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule,

        ReportsRoutingModule,
        ReportsDprModule,
        LongtermModule,
        TablesModule,
    ],
    exports: [RouterModule],
    providers: [CommonService],
    declarations: [ReportsComponent],
    bootstrap: [ReportsComponent],
})
export class ReportsModule {}

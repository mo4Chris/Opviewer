import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { AutosizeModule } from 'ngx-autosize';

import { ReportsDprComponent } from './reports-dpr.component';
import { PageHeaderModule, SharedPipesModule } from '@app/shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {CommonService} from '@app/common.service';
import { UserService } from '@app/shared/services/user.service';

import { CalculationService } from '@app/supportModules/calculation.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { EventService } from '@app/supportModules/event.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterService } from '@app/supportModules/router.service';
import { SovreportModule } from './sov/sovreport.module';
import { CtvslipgraphComponent } from './ctv/models/ctvslipgraph/ctvslipgraph.component';
import { CtvSummaryComponent } from './ctv/ctv-summary/ctv-summary.component';
import { CtvTurbineTransferComponent } from './ctv/ctv-turbine-transfer/ctv-turbine-transfer.component';

@NgModule({
    imports: [
        HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        AutosizeModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        SovreportModule,
    ],
    declarations: [CtvreportComponent, ReportsDprComponent, CtvslipgraphComponent, CtvSummaryComponent, CtvTurbineTransferComponent],
    providers: [CommonService, CalculationService, UserService, EventService, RouterService],
    bootstrap: [ReportsDprComponent],
    exports: [ReportsDprComponent],
})
export class ReportsDprModule {}

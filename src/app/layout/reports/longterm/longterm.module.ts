import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { LongtermRoutingModule } from './longterm-routing.module';
import { LongtermComponent } from './longterm.component';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { LongtermSOVComponent } from './sov/longtermSOV.component';
import { PageHeaderModule } from '@app/shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '@app/common.service';
import { UserService } from '@app/shared/services/user.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DeploymentGraphComponent } from './ctv/models/deploymentgraph/deploymentGraph.component';
import { UtilizationGraphComponent } from './sov/models/longterm_utilization/utilizationGraph.component';
import { VesselinfoComponent } from './ctv/models/vesselinfo/vesselinfo.component';
import { SiemensKpiOverviewComponent } from './sov/models/siemens-kpi-overview/siemens-kpi-overview.component';
import { LongtermBarGraphComponent } from './models/longterm-bar-graph/longterm-bar-graph.component';
import { LongtermTrendGraphComponent } from './models/longterm-trend-graph/longterm-trend-graph.component';
import { LongtermScatterGraphComponent } from './models/longterm-scatter-graph/longterm-scatter-graph.component';
import { EngineOverviewComponent } from './ctv/models/engine-overview/engine-overview.component';
import { LongtermPrintHeaderComponent } from './models/longterm-print-header/longterm-print-header.component';

@NgModule({
    imports: [
        HttpClientModule,
        FormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        ReactiveFormsModule,
        CommonModule,
        LongtermRoutingModule,
        PageHeaderModule
    ],
    declarations: [
        LongtermCTVComponent,
        LongtermSOVComponent,
        DeploymentGraphComponent,
        UtilizationGraphComponent,
        VesselinfoComponent,
        LongtermComponent,
        SiemensKpiOverviewComponent,
        LongtermScatterGraphComponent,
        LongtermBarGraphComponent,
        LongtermTrendGraphComponent,
        EngineOverviewComponent,
        LongtermPrintHeaderComponent,
    ],
    providers: [CommonService, UserService],
    bootstrap: [LongtermComponent],
    exports: [LongtermComponent]
})
export class LongtermModule {}

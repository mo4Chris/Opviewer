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
import { CtvLongtermUtilSubGraphComponent } from './ctv/models/longterm_utilization/longterm-util-sub-graph/longterm-util-sub-graph.component';
import { CtvUtilizationGraphComponent } from './ctv/models/longterm_utilization/utilizationGraph.component';
import { LongtermPrintHeaderbarComponent } from './models/longterm-print-headerbar/longterm-print-headerbar.component';
import { FuelOverviewComponent } from './ctv/models/fuel-overview/fuel-overview.component';
import { CtvKpiOverviewComponent } from './ctv/models/kpi-overview/ctv-kpi-overview.component';
import { FuelUsageOverviewComponent } from './ctv/models/fuel-overview/fuel-usage-overview/fuel-usage-overview.component';
import { FuelAverageOverviewComponent } from './ctv/models/fuel-overview/fuel-average-overview/fuel-average-overview.component';
import { FuelAverageOverviewGraphComponent } from './ctv/models/fuel-overview/fuel-average-overview/fuel-average-overview-graph/fuel-average-overview-graph.component';


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
        CtvUtilizationGraphComponent,
        CtvLongtermUtilSubGraphComponent,
        VesselinfoComponent,
        LongtermComponent,
        SiemensKpiOverviewComponent,
        CtvKpiOverviewComponent,
        LongtermScatterGraphComponent,
        LongtermBarGraphComponent,
        LongtermTrendGraphComponent,
        LongtermPrintHeaderComponent,
        EngineOverviewComponent,
        LongtermPrintHeaderbarComponent,
        FuelOverviewComponent,
        FuelUsageOverviewComponent,
        FuelAverageOverviewComponent,
        FuelAverageOverviewGraphComponent
    ],
    providers: [CommonService, UserService],
    bootstrap: [LongtermComponent],
    exports: [LongtermComponent]
})
export class LongtermModule {}

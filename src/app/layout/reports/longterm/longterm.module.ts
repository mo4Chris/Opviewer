import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { LongtermRoutingModule } from './longterm-routing.module';
import { LongtermComponent } from './longterm.component';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { LongtermSOVComponent } from './sov/longtermSOV.component';
import { PageHeaderModule } from '../../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../../common.service';
import { UserService } from '../../../shared/services/user.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DeploymentGraphComponent } from './ctv/models/deploymentgraph/deploymentGraph.component';
import { UtilizationGraphComponent } from './sov/models/utilizationGraph.component';
import { VesselinfoComponent } from './ctv/models/vesselinfo/vesselinfo.component';
import { SiemensKpiOverviewComponent } from '../dpr/sov/models/siemens-kpi-overview/siemens-kpi-overview.component';

@NgModule({
    imports: [
        HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
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
        SiemensKpiOverviewComponent
    ],
    providers: [CommonService, UserService],
    bootstrap: [LongtermComponent],
    exports: [LongtermComponent]
})
export class LongtermModule {}

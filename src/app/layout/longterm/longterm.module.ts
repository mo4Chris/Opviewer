import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { LongtermRoutingModule } from './longterm-routing.module';
import { LongtermComponent } from './longterm.component';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { LongtermSOVComponent } from './sov/longtermSOV.component';
import { PageHeaderModule } from '../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../common.service';
import { UserService } from '../../shared/services/user.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LongtermCTVModule } from './ctv/longtermCTV.module';
import { DeploymentGraphComponent } from './models/deploymentgraph/deploymentGraph.component';

@NgModule({
    imports: [ HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        ReactiveFormsModule,
        CommonModule,
        LongtermRoutingModule,
        PageHeaderModule,
        LongtermCTVModule
    ],
    declarations: [LongtermComponent, LongtermCTVComponent, LongtermSOVComponent, DeploymentGraphComponent],
    providers: [CommonService, UserService],
    bootstrap: [LongtermComponent]
})
export class LongtermModule {}

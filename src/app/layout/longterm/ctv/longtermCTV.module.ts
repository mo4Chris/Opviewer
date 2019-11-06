import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { PageHeaderModule } from '../../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../../common.service';
import { UserService } from '../../../shared/services/user.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DeploymentGraphComponent } from '../models/deploymentgraph/deploymentGraph.component';

@NgModule({
    imports: [ HttpClientModule,
        FormsModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        ReactiveFormsModule,
        CommonModule,
        PageHeaderModule],
    providers: [CommonService, UserService],
    // declarations: [DeploymentGraphComponent]
})
export class LongtermCTVModule {}
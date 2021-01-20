import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { FleetRequestRoutingModule } from './fleet-request-routing.module';
import { FleetRequestComponent } from './fleet-request.component';
import { PageHeaderModule } from '../../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import {CommonService} from '../../../common.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        FleetRequestRoutingModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule
    ],
    declarations: [FleetRequestComponent],
    providers: [CommonService],
    bootstrap: [FleetRequestComponent]
})
export class FleetRequestModule {}

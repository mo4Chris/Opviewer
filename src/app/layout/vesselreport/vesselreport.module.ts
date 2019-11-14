import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { VesselreportRoutingModule } from './vesselreport-routing.module';
import { VesselreportComponent } from './vesselreport.component';
import { PageHeaderModule, SharedPipesModule } from '../../shared';
// import { DatePickerComponent } from './../bs-component/components'

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {CommonService} from '../../common.service';
import { UserService } from '../../shared/services/user.service';

import { CalculationService } from '../../supportModules/calculation.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport/sovreport.component';
import { EventService } from '../../supportModules/event.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterService } from '../../supportModules/router.service';

@NgModule({
    imports: [ HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        CommonModule,
        VesselreportRoutingModule,
        PageHeaderModule,
        SharedPipesModule],
    declarations: [VesselreportComponent, SovreportComponent, CtvreportComponent],
    providers: [CommonService, CalculationService, UserService, EventService, RouterService],
    bootstrap: [VesselreportComponent]
})
export class VesselreportModule {}

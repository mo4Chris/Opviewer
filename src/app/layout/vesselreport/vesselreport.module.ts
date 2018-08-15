import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { VesselreportRoutingModule } from './vesselreport-routing.module';
import { VesselreportComponent } from './vesselreport.component';
import { PageHeaderModule } from '../../shared';
//import { DatePickerComponent } from './../bs-component/components'

//modules mongoDB   

import { HttpModule } from '@angular/http';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
  
import {CommonService} from '../../common.service'; 

@NgModule({
    imports: [ HttpModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw',
            apiVersion: '3.31'
        }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        CommonModule,
        //DatePickerComponent, 
        VesselreportRoutingModule, 
        PageHeaderModule],
    declarations: [VesselreportComponent, VesselreportComponent],
    providers: [CommonService],  
    bootstrap: [VesselreportComponent]
})
export class VesselreportModule {}

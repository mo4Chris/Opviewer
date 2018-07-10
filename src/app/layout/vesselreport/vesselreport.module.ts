import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { VesselreportRoutingModule } from './vesselreport-routing.module';
import { VesselreportComponent } from './vesselreport.component';
import { PageHeaderModule } from './../../shared';

//modules mongoDB   

import { HttpModule } from '@angular/http';  
import { FormsModule } from '@angular/forms';  
  
import {CommonService} from '../../common.service'; 

@NgModule({
    imports: [ HttpModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBo-s6bmJYN-5Pw-Lw_DKSd8wtq_whx4NE'
        }),
        FormsModule,
        CommonModule, 
        VesselreportRoutingModule, 
        PageHeaderModule],
    declarations: [VesselreportComponent, VesselreportComponent],
    providers: [CommonService],  
    bootstrap: [VesselreportComponent]
})
export class VesselreportModule {}

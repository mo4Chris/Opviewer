import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { VesselreportRoutingModule } from './vesselreport-routing.module';
import { VesselreportComponent } from './vesselreport.component';
import { PageHeaderModule } from '../../shared';
// import { DatePickerComponent } from './../bs-component/components'

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../../common.service';
import { ReportComponent } from './sov/report/report.component';
import { CalculationService } from '../../supportModules/calculation.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';

@NgModule({
    imports: [ HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        CommonModule,
        VesselreportRoutingModule,
        PageHeaderModule],
    declarations: [VesselreportComponent, ReportComponent, CtvreportComponent],
    providers: [CommonService, CalculationService],
    bootstrap: [VesselreportComponent]
})
export class VesselreportModule {}

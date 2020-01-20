import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { AutosizeModule } from 'ngx-autosize';

// import { ReportsDprRoutingModule } from './reports-dpr-routing.module';
import { ReportsDprComponent } from './reports-dpr.component';
import { PageHeaderModule, SharedPipesModule } from '../../../shared';
// import { DatePickerComponent } from './../bs-component/components'

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {CommonService} from '@app/common.service';
import { UserService } from '@app/shared/services/user.service';

import { CalculationService } from '@app/supportModules/calculation.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { EventService } from '@app/supportModules/event.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterService } from '@app/supportModules/router.service';
import { SovreportModule } from './sov/sovreport.module';
import { WaveSpectrumComponentComponent } from './sov/models/wave-spectrum-component/wave-spectrum-component.component';
import { PlotlyModule } from 'angular-plotly.js';

@NgModule({
    imports: [
        HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        AutosizeModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        PlotlyModule,
        SovreportModule,
    ],
    declarations: [CtvreportComponent, ReportsDprComponent, WaveSpectrumComponentComponent],
    providers: [CommonService, CalculationService, UserService, EventService, RouterService],
    bootstrap: [ReportsDprComponent],
    exports: [ReportsDprComponent],
})
export class ReportsDprModule {}

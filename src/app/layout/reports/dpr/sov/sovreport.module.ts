import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { CalculationService } from '@app/supportModules/calculation.service';
import { AutosizeModule } from 'ngx-autosize';
import { SovreportComponent } from './sovreport.component';
import { SovSummaryComponent } from './sov-summary/sov-summary.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '@app/shared';
import { AgmCoreModule } from '@agm/core';
import { SovDprInputComponent } from './sov-dpr-input/sov-dpr-input.component';
import { SovDprInputVesselmasterComponent } from './sov-dpr-input/sov-dpr-input-vesselmaster/sov-dpr-input-vesselmaster.component';
import { SovDprInputReadonlyComponent } from './sov-dpr-input/sov-dpr-input-readonly/sov-dpr-input-readonly.component';
import { SovTurbineTransfersComponent } from './sov-turbine-transfers/sov-turbine-transfers.component';
import { SovPlatformTransfersComponent } from './sov-platform-transfers/sov-platform-transfers.component';
import { SovV2vTransfersComponent } from './sov-v2v-transfers/sov-v2v-transfers.component';
import { SovWeatherchartComponent } from './models/sov-weatherchart/sov-weatherchart.component';
import { WaveSpectrumComponentComponent } from './models/wave-spectrum-component/wave-spectrum-component.component';
import { PlotlyModule } from 'angular-plotly.js';
import { SovHseDprInputComponent } from './sov-hse-dpr-input/sov-hse-dpr-input.component';
import { SovHseDprInputReadonlyComponent } from './sov-hse-dpr-input/sov-hse-dpr-input-readonly/sov-hse-dpr-input-readonly.component';
import { SovHseDprInputVesselmasterComponent } from './sov-hse-dpr-input/sov-hse-dpr-input-vesselmaster/sov-hse-dpr-input-vesselmaster.component';

@NgModule({
  imports: [
    Ng2Charts,
    CommonModule,
    AutosizeModule,
    NgbModule,
    FormsModule,
    SharedPipesModule,
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
    }),
    PlotlyModule,
  ],
  providers: [CalculationService],
  declarations: [
    SovreportComponent,
    SovSummaryComponent,
    SovSummaryComponent,
    SovDprInputComponent,
    SovDprInputVesselmasterComponent,
    SovDprInputReadonlyComponent,
    SovTurbineTransfersComponent,
    SovPlatformTransfersComponent,
    SovV2vTransfersComponent,
    SovWeatherchartComponent,
    WaveSpectrumComponentComponent,
    SovHseDprInputComponent,
    SovHseDprInputReadonlyComponent,
    SovHseDprInputVesselmasterComponent,
  ],
  exports: [SovreportComponent]
})
export class SovreportModule { }

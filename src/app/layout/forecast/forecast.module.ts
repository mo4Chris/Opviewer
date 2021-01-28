import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/common.service';
import { Mo4testComponent } from './mo4test/mo4test.component';
import { ForecastRoutingModule } from './forecast-routing.module';
import { FormsModule } from '@angular/forms';
import { ForecastOpsPickerComponent } from './mo4test/forecast-ops-picker/forecast-ops-picker.component';
import { ForecastLimitsPickerComponent } from './mo4test/forecast-limits-picker/forecast-limits-picker.component';
import { SurfacePlotComponent } from './models/surface-plot/surface-plot.component';
import { ForecastWorkabilityPlotComponent } from './models/forecast-workability-plot/forecast-workability-plot.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotlyModule } from 'angular-plotly.js';
import { SupportModelModule } from '@app/models/support-model.module';
import { ForecastWorkabilityComponent } from './mo4test/forecast-workability/forecast-workability.component';
import { HeadingPickerComponent } from './models/heading-picker/heading-picker.component';
import { ForecastProjectComponent } from './forecast-project/forecast-project.component';
import { AgmCoreModule } from '@agm/core';
import { ForecastNewProjectComponent } from './forecast-new-project/forecast-new-project.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ForecastRoutingModule,
    NgbModule,
    PlotlyModule,
    SupportModelModule,
    AgmCoreModule,
  ],
  providers: [
    CommonService
  ],
  exports:[
    Mo4testComponent,
  ],
  declarations: [
    Mo4testComponent,
    ForecastOpsPickerComponent,
    ForecastLimitsPickerComponent,
    SurfacePlotComponent,
    ForecastWorkabilityPlotComponent,
    ForecastWorkabilityComponent,
    HeadingPickerComponent,
    ForecastProjectComponent,
    ForecastNewProjectComponent
  ],
  bootstrap: [
    Mo4testComponent
  ],
})
export class ForecastModule {
}

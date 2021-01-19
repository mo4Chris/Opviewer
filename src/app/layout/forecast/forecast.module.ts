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
import { ForecastWorkabilitySurfaceComponent } from './mo4test/forecast-workability-surface/forecast-workability-surface.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ForecastRoutingModule,
    NgbModule,
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
    ForecastWorkabilitySurfaceComponent
  ],
  bootstrap: [
    Mo4testComponent
  ],
})
export class ForecastModule {
}

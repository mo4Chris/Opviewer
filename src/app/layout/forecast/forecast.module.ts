import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/common.service';
import { ForecastRoutingModule } from './forecast-routing.module';
import { FormsModule } from '@angular/forms';
import { SurfacePlotComponent } from './models/surface-plot/surface-plot.component';
import { ForecastWorkabilityPlotComponent } from './models/forecast-workability-plot/forecast-workability-plot.component';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SupportModelModule } from '@app/models/support-model.module';
import { HeadingPickerComponent } from './models/heading-picker/heading-picker.component';
import { ForecastVesselComponent } from './forecast-project/forecast-project.component';
import { AgmCoreModule } from '@agm/core';
import { ForecastNewVesselComponent } from './forecast-new-vessel/forecast-new-vessel.component';
import { NgxUploaderDirectiveModule } from 'ngx-uploader-directive';
import { FileUploadComponent } from './models/file-upload/file-upload.component';
import { VesselLocationIndicatorComponent } from './models/vessel-location-indicator/vessel-location-indicator.component';
import { ForecastDashboardComponent } from './forecast-dashboard/forecast-dashboard.component';
import { Mo4LightComponent } from './mo4-light/mo4-light.component';
import { ForecastOpsPickerComponent } from './forecast-ops-picker/forecast-ops-picker.component';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { ForecastWeatherOverviewComponent } from './models/forecast-weather-overview/forecast-weather-overview.component';
import { SovWaveSpectrumComponent } from './models/wave-spectrum/wave-spectrum.component';
import { WeatherOverviewComponent } from './models/weather-overview/weather-overview.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ForecastRoutingModule,
    NgbModule,
    PlotlyModule,
    SupportModelModule,
    AgmCoreModule,
    NgbDatepickerModule,
    NgxUploaderDirectiveModule
  ],
  providers: [
    CommonService
  ],
  declarations: [
    ForecastOpsPickerComponent,
    SurfacePlotComponent,
    ForecastWorkabilityPlotComponent,
    HeadingPickerComponent,
    ForecastVesselComponent,
    ForecastNewVesselComponent,
    FileUploadComponent,
    VesselLocationIndicatorComponent,
    ForecastDashboardComponent,
    Mo4LightComponent,
    ForecastWeatherOverviewComponent,
    SovWaveSpectrumComponent,
    WeatherOverviewComponent
  ],
  bootstrap: [
    Mo4LightComponent
  ],
})
export class ForecastModule {
}

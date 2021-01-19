import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/common.service';
import { Mo4testComponent } from './mo4test/mo4test.component';
import { ForecastRoutingModule } from './forecast-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ForecastRoutingModule,
  ],
  providers: [
    CommonService
  ],
  exports:[
    Mo4testComponent,
  ],
  declarations: [
    Mo4testComponent
  ],
  bootstrap: [
    Mo4testComponent
  ],
})
export class ForecastModule {
}

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
  ],
  providers: [CalculationService],
  declarations: [SovreportComponent, SovSummaryComponent, SovSummaryComponent, SovDprInputComponent, SovDprInputVesselmasterComponent, SovDprInputReadonlyComponent],
  exports: [SovreportComponent]
})
export class SovreportModule { }

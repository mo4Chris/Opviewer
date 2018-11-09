import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { chartAnnotation } from 'chartjs-plugin-annotation';

import { ReportRoutingModule } from './report-routing.module';
import { CalculationService } from '../../../../supportModules/calculation.service';

@NgModule({
  imports: [
    Ng2Charts,
    chartAnnotation,
    CommonModule,
    ReportRoutingModule
  ],
  providers: [CalculationService]
})
export class ReportModule { }

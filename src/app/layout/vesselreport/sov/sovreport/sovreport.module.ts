import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { chartAnnotation } from 'chartjs-plugin-annotation';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    Ng2Charts,
    chartAnnotation,
    CommonModule
  ],
  providers: [CalculationService]
})
export class SovreportModule { }

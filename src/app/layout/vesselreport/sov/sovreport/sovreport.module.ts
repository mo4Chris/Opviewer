import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { CalculationService } from '../../../../supportModules/calculation.service';

@NgModule({
  imports: [
    Ng2Charts,
    CommonModule
  ],
  providers: [CalculationService]
})
export class SovreportModule { }

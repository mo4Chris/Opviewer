import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SovHseDprInputReadonlyComponent } from './sov-hse-dpr-input-readonly/sov-hse-dpr-input-readonly.component';
import { SovHseDprInputVesselmasterComponent } from './sov-hse-dpr-input-vesselmaster/sov-hse-dpr-input-vesselmaster.component';

@NgModule({
  declarations: [ SovHseDprInputReadonlyComponent, SovHseDprInputVesselmasterComponent,],
  imports: [
    CommonModule
  ]
})
export class SovHseDprInputModule { }

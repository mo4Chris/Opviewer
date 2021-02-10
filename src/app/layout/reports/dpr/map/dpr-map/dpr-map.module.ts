import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DprMapComponent } from './dpr-map.component';
import { AgmCoreModule } from '@agm/core';
import { AutosizeModule } from 'ngx-autosize';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@NgModule({
  imports: [
    CommonModule,
    AgmCoreModule,
    AutosizeModule,
    NgbModule,
  ],
  declarations: [
    DprMapComponent,
  ],
  exports: [
    DprMapComponent
  ],
})
export class DprMapModule { }

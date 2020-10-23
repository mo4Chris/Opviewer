import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DprMapComponent } from './dpr-map.component';
import { AgmCoreModule } from '@agm/core';
import { env } from 'process';
import { AutosizeModule } from 'ngx-autosize';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({
        apiKey: env.GOOGLE_API_KEY
    }),
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

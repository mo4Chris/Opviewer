import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../../common.service';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbModule.forRoot(),
    CommonModule
  ],
  providers: [CommonService, DatetimeService],
  declarations: []
})
export class CtvreportModule { }

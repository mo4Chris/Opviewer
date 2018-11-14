import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../common.service';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    CommonModule
  ],
  providers: [CommonService, DatetimeService],
  declarations: []
})
export class CtvreportModule { }

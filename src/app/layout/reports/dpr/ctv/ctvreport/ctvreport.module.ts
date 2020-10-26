import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../../common.service';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MapStore } from '@app/stores/map.store';
import { CtvreportComponent } from './ctvreport.component';
import { CtvslipgraphComponent } from '../models/ctvslipgraph/ctvslipgraph.component';
import { CtvSummaryComponent } from '../ctv-summary/ctv-summary.component';
import { CtvTurbineTransferComponent } from '../ctv-turbine-transfer/ctv-turbine-transfer.component';
import { DprMapModule } from '../../map/dpr-map/dpr-map.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { SharedPipesModule } from '@app/shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    DprMapModule,
    FormsModule,
    AutosizeModule,
    ReactiveFormsModule,
    NgbModule,
    CommonModule,
    SharedPipesModule,
    NgMultiSelectDropDownModule,
  ],
  providers: [
    CommonService,
    DatetimeService,
  ],
  declarations: [
    CtvreportComponent,
    CtvslipgraphComponent,
    CtvSummaryComponent,
    CtvTurbineTransferComponent
  ],
  exports: [
    CtvreportComponent
  ]
})
export class CtvreportModule { }

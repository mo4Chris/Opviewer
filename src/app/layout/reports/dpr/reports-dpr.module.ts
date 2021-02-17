import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AutosizeModule } from 'ngx-autosize';
import { ReportsDprComponent } from './reports-dpr.component';
import { PageHeaderModule, SharedPipesModule } from '@app/shared';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '@app/common.service';
import { UserService } from '@app/shared/services/user.service';
import { CalculationService } from '@app/supportModules/calculation.service';
import { EventService } from '@app/supportModules/event.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterService } from '@app/supportModules/router.service';
import { SovreportModule } from './sov/sovreport.module';
import { CtvreportModule } from './ctv/ctvreport/ctvreport.module';

@NgModule({
    imports: [
        HttpClientModule,
        FormsModule,
        AutosizeModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        SovreportModule,
        CtvreportModule,
    ],
    declarations: [
        ReportsDprComponent,
    ],
    providers: [
        CommonService,
        CalculationService,
        UserService,
        EventService,
        RouterService,
    ],
    bootstrap: [
        ReportsDprComponent
    ],
    exports: [
        ReportsDprComponent
    ],
})
export class ReportsDprModule {}

import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UserService } from '../../../../shared/services/user.service';
import { CommonService } from '../../../../common.service';
import { PageHeaderModule } from '../../../../shared';
import { ReportsComponent } from '../../reports.component';

@NgModule({
    imports: [ HttpClientModule,
        FormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        ReactiveFormsModule,
        CommonModule,
        // LongtermRoutingModule,
        PageHeaderModule,
    ],
    providers: [CommonService, UserService],
    bootstrap: [ReportsComponent],
})
export class LongtermSOVModule {}

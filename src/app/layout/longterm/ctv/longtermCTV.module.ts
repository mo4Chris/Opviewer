import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { LongtermCTVComponent } from './longtermCTV.component';
import { PageHeaderModule } from '../../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../../common.service';
import { UserService } from '../../../shared/services/user.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    imports: [ HttpClientModule,
        FormsModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        ReactiveFormsModule,
        CommonModule,
        // LongtermRoutingModule,
        PageHeaderModule],
    declarations: [LongtermCTVComponent, LongtermCTVComponent],
    providers: [CommonService, UserService],
    bootstrap: [LongtermCTVComponent]
})
export class LongtermCTVModule {}
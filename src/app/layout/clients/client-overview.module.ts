import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-overview-routing.module';
import { ClientOverviewComponent } from './client-overview.component';
import { PageHeaderModule } from '../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CommonService } from '../../common.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UserService } from '../../shared/services/user.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ClientRoutingModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule
    ],
    declarations: [ClientOverviewComponent],
    providers: [CommonService, UserService],
    bootstrap: [ClientOverviewComponent]
})
export class ClientOverviewModule {}

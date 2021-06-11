import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './usermanagement-routing.module';
import { UserManagementComponent } from './usermanagement.component';
import { PageHeaderModule } from '@app/shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CommonService } from '@app/common.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UserService } from '@app/shared/services/user.service';

@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule, UserManagementRoutingModule, PageHeaderModule, NgbModule, NgMultiSelectDropDownModule],
    declarations: [UserManagementComponent],
    providers: [CommonService, UserService],
    bootstrap: [UserManagementComponent]
})
export class UserManagementModule {}

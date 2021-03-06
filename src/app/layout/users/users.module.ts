import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { PageHeaderModule } from './../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../common.service';
import { UserService } from '../../shared/services/user.service';

@NgModule({
    imports: [CommonModule,
        HttpClientModule,
        FormsModule,
        UsersRoutingModule,
        NgbModule,
        PageHeaderModule],
    declarations: [UsersComponent],
    providers: [CommonService, UserService],
    bootstrap: [UsersComponent]
})
export class UsersModule {}

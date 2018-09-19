import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { PageHeaderModule } from './../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../common.service';

@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule, UsersRoutingModule, PageHeaderModule],
    declarations: [UsersComponent],
    providers: [CommonService],
    bootstrap: [UsersComponent]
})
export class UsersModule {}

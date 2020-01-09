import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';
import { TablesComponent } from './tables.component';
import { PageHeaderModule } from './../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CommonService } from '../../common.service';
import { UserService } from '../../shared/services/user.service';
import { LongtermModule } from '../reports/longterm/longterm.module';

@NgModule({
    imports: [ HttpClientModule, FormsModule, CommonModule, TablesRoutingModule, PageHeaderModule, LongtermModule],
    declarations: [TablesComponent, TablesComponent],
    providers: [CommonService, UserService],
    bootstrap: [TablesComponent]
})
export class TablesModule {}

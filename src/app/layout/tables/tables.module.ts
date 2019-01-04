import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';
import { TablesComponent } from './tables.component';
import { PageHeaderModule } from './../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../common.service';
import { VesselreportModule } from '../vesselreport/vesselreport.module';
import { ScatterplotModule } from '../scatterplot/scatterplot.module';
import { UserService } from '../../shared/services/user.service';

@NgModule({
    imports: [ HttpClientModule, FormsModule, CommonModule, TablesRoutingModule, PageHeaderModule, VesselreportModule, ScatterplotModule],
    declarations: [TablesComponent, TablesComponent],
    providers: [CommonService, UserService],
    bootstrap: [TablesComponent]
})
export class TablesModule {}

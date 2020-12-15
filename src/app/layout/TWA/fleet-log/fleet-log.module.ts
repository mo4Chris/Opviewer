import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FleetLogRoutingModule } from './fleet-log-routing.module';
import { FleetLogComponent } from './fleet-log.component';
import { PageHeaderModule } from '../../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../../common.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        FleetLogRoutingModule,
        PageHeaderModule
    ],
    declarations: [FleetLogComponent],
    providers: [CommonService],
    bootstrap: [FleetLogComponent]
})
export class FleetLogModule {}

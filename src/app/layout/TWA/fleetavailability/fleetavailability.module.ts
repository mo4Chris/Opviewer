import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { FleetavailabilityRoutingModule } from './fleetavailability-routing.module';
import { FleetavailabilityComponent } from './fleetavailability.component';
import { PageHeaderModule } from '../../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../../common.service';

@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule, NgbModule, FleetavailabilityRoutingModule, PageHeaderModule],
    declarations: [FleetavailabilityComponent],
    providers: [CommonService],
    bootstrap: [FleetavailabilityComponent]
})
export class FleetavailabilityModule {}

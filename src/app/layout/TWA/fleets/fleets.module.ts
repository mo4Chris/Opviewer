import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetsRoutingModule } from './fleets-routing.module';
import { FleetsComponent } from './fleets.component';
import { PageHeaderModule } from '../../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../../common.service';

@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule, NgbModule.forRoot(), FleetsRoutingModule, PageHeaderModule],
    declarations: [FleetsComponent],
    providers: [CommonService],
    bootstrap: [FleetsComponent]
})
export class FleetsModule {}

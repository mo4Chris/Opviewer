import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormRoutingModule } from './form-routing.module';
import { FormComponent } from './form.component';
import { PageHeaderModule } from './../../shared';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import {CommonService} from '../../common.service';

@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule, FormRoutingModule, PageHeaderModule],
    declarations: [FormComponent],
    providers: [CommonService],
    bootstrap: [FormComponent]
})
export class FormModule {}

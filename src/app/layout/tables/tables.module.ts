import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';
import { TablesComponent } from './tables.component';
import { PageHeaderModule } from './../../shared';

//modules mongoDB   

import { HttpModule } from '@angular/http';  
import { FormsModule } from '@angular/forms';  
  
import {CommonService} from '../../common.service'; 

@NgModule({
    imports: [ HttpModule, FormsModule, CommonModule, TablesRoutingModule, PageHeaderModule],
    declarations: [TablesComponent, TablesComponent],
    providers: [CommonService],  
    bootstrap: [TablesComponent]
})
export class TablesModule {}

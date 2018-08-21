import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { ScatterplotRoutingModule } from './scatterplot-routing.module';
import { ScatterplotComponent } from './scatterplot.component';
import { PageHeaderModule } from '../../shared';
import { ChartsModule as Ng2Charts } from 'ng2-charts';

//modules mongoDB   

import { HttpModule } from '@angular/http';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
  
import {CommonService} from '../../common.service'; 

@NgModule({
    imports: [ HttpModule,
        Ng2Charts,
        FormsModule,
        NgbModule.forRoot(),
        ReactiveFormsModule,
        CommonModule,
        ScatterplotRoutingModule, 
        PageHeaderModule],
    declarations: [ScatterplotComponent, ScatterplotComponent],
    providers: [CommonService],  
    bootstrap: [ScatterplotComponent]
})
export class ScatterplotModule {}

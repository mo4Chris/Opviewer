import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';

import { HttpModule } from '@angular/http';  
import { FormsModule } from '@angular/forms';  
  
import {CommonService} from '../../common.service';


import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {
    TimelineComponent,
    NotificationComponent,
    ChatComponent
} from './components';
import { StatModule } from '../../shared';

@NgModule({
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        NgbCarouselModule.forRoot(),
        NgbAlertModule.forRoot(),
        DashboardRoutingModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBo-s6bmJYN-5Pw-Lw_DKSd8wtq_whx4NE'
        }),
        StatModule
    ],
    declarations: [
        DashboardComponent,
        TimelineComponent,
        NotificationComponent,
        ChatComponent
    ],
    providers:[CommonService],
    bootstrap: [DashboardComponent]
})
export class DashboardModule {

}

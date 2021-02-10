import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { StatModule } from '../../shared';
import { UserService } from '../../shared/services/user.service';
import { AdminComponent } from './components/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/vessel-master/vessel-master.component';
import { environment } from 'environments/environment';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        NgbCarouselModule,
        NgbAlertModule,
        DashboardRoutingModule,
        AgmCoreModule,
        AgmJsMarkerClustererModule,
        AgmSnazzyInfoWindowModule,
        StatModule,
        NgbModule,
    ],
    declarations: [
        DashboardComponent,
        AdminComponent,
        LogisticsSpecialistComponent,
        MarineControllerComponent,
        VesselMasterComponent
    ],
    providers: [UserService],
    bootstrap: [DashboardComponent]
})
export class DashboardModule {

}

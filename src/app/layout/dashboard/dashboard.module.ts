import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { OsmDashboardMapComponent } from '@app/layout/components/openSeaMaps/osm-dashboard-map/osm-dashboard-map.component'
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { StatModule } from '@app/shared';
import { UserService } from '@app/shared/services/user.service';
import { AdminComponent } from './components/admin/admin.component';
import { LogisticsSpecialistComponent } from './components/logistics-specialist/logistics-specialist.component';
import { MarineControllerComponent } from './components/marine-controller/marine-controller.component';
import { VesselMasterComponent } from './components/vessel-master/vessel-master.component';
import { environment } from 'environments/environment';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        NgbCarouselModule,
        NgbAlertModule,
        DashboardRoutingModule,
        LeafletModule,
        LeafletMarkerClusterModule,
        AgmCoreModule.forRoot({
            apiKey: environment.GOOGLE_API_KEY
        }),
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
        VesselMasterComponent,
        OsmDashboardMapComponent
    ],
    providers: [UserService],
    bootstrap: [DashboardComponent]
})
export class DashboardModule {

}

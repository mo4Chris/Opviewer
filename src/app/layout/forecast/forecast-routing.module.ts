import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ForecastVesselComponent } from './forecast-project/forecast-project.component';
import { ForecastNewVesselComponent } from './forecast-new-vessel/forecast-new-vessel.component';
import { ForecastDashboardComponent } from './forecast-dashboard/forecast-dashboard.component';
import { Mo4LightComponent } from './mo4-light/mo4-light.component';

const routes: Routes = [
    { path: '', component: ForecastDashboardComponent },
    { path: 'new-vessel', component: ForecastNewVesselComponent },
    { path: 'project', component: Mo4LightComponent },
    { path: 'project-overview', component: ForecastVesselComponent },
    { path: '**', component: ForecastDashboardComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class ForecastRoutingModule {
}

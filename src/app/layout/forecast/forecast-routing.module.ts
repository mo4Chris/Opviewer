import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Mo4testComponent } from './mo4test/mo4test.component';
import { ForecastVesselComponent } from './forecast-project/forecast-project.component';
import { ForecastNewVesselComponent } from './forecast-new-vessel/forecast-new-vessel.component';

const routes: Routes = [
    { path: '', component: Mo4testComponent },
    { path: 'new', component: ForecastNewVesselComponent },
    { path: 'project', component: ForecastVesselComponent },
    { path: '**', component: Mo4testComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class ForecastRoutingModule {
}

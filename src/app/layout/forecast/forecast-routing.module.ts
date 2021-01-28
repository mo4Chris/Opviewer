import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Mo4testComponent } from './mo4test/mo4test.component';
import { ForecastProjectComponent } from './forecast-project/forecast-project.component';
import { ForecastNewProjectComponent } from './forecast-new-project/forecast-new-project.component';

const routes: Routes = [
    { path: '', component: Mo4testComponent },
    { path: 'new', component: ForecastNewProjectComponent },
    { path: 'project', component: ForecastProjectComponent },
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

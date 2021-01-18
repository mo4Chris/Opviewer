import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Mo4testComponent } from './mo4test/mo4test.component';

const routes: Routes = [
    { path: '', component: Mo4testComponent },
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

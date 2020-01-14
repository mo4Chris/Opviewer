import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsDprComponent } from './reports-dpr.component';


const routes: Routes = [
    // {
    //     path: '', component: ReportDprComponent
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsDprRoutingModule {
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LongtermComponent } from './longterm.component';

const routes: Routes = [
    // {
    //     path: '', component: LongtermComponent
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LongtermRoutingModule {}

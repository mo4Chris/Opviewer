import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FleetsComponent } from './fleets.component';

const routes: Routes = [
    {
        path: '', component: FleetsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FleetsRoutingModule {
}

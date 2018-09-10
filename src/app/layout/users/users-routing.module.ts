import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
//import { VesselreportComponent } from '../vesselreport/vesselreport.component';

const routes: Routes = [
    {
        path: '', component: UsersComponent
    }, {
        //path: 'usermanagent/:username', component: VesselreportComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule {
}

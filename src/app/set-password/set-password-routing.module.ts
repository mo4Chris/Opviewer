import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetPasswordComponent } from './set-password.component';

const routes: Routes = [
    {
        path: '', component: SetPasswordComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SetPasswordRoutingModule {
}

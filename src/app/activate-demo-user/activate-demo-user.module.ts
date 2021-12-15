import { NgModule } from '@angular/core';
import { ActivateDemoUserComponent } from './activate-demo-user.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
      { path: '', component: ActivateDemoUserComponent}, 
      { path: ':token', component: ActivateDemoUserComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ActivateDemoUserModule { }

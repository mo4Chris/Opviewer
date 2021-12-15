import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';

const routes: Routes = [
    { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard] },
    { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
    { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule) },
    { path: 'registration', loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationModule) },
    { path: 'set-password', loadChildren: () => import('./set-password/set-password.module').then(m => m.SetPasswordModule)  },
    { path: 'activate-demo-user', loadChildren: () => import('./activate-demo-user/activate-demo-user.module').then(m => m.ActivateDemoUserModule)  },
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {enableTracing: false})],
    exports: [RouterModule]
})
export class AppRoutingModule {}

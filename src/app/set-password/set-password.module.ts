import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';


import { SetPasswordRoutingModule } from './set-password-routing.module';
import { SetPasswordComponent } from './set-password.component';
import {CommonService} from '../common.service';


@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    SetPasswordRoutingModule,
    NgbModule.forRoot(),
    NgxQRCodeModule,
    FormsModule
  ],
  providers: [CommonService],
    declarations: [SetPasswordComponent]
})
export class SetPasswordModule { }

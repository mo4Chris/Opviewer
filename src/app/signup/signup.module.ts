import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import {CommonService} from '../common.service';


@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    SignupRoutingModule,
    NgbModule.forRoot(),
    FormsModule
  ],
  providers: [CommonService],
  declarations: [SignupComponent]
})
export class SignupModule { }

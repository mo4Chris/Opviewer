import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';  


import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import {CommonService} from '../common.service';


@NgModule({
  imports: [
  	HttpModule,
    CommonModule,
    SignupRoutingModule, 
    FormsModule
  ],
  providers: [CommonService],
  declarations: [SignupComponent]
})
export class SignupModule { }

import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';
import {CommonService} from '../common.service';
import { UserService } from '../shared/services/user.service';


@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    SignupRoutingModule,
    NgbModule.forRoot(),
    FormsModule
  ],
  providers: [CommonService, UserService],
  declarations: [SignupComponent]
})
export class SignupModule { }

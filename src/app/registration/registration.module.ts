import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationComponent } from './registration.component';
import {CommonService} from '@app/common.service';
import { UserService } from '@app/shared/services/user.service';


@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    RegistrationRoutingModule,
    NgbModule,
    FormsModule,
  ],
  providers: [CommonService, UserService],
  declarations: [RegistrationComponent]
})
export class RegistrationModule { }

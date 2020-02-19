import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLoadingComponent } from './ng-loading/ng-loading.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [NgLoadingComponent, ConfirmComponent],
  bootstrap: [NgLoadingComponent],
  exports: [NgLoadingComponent, ConfirmComponent],
})
export class SupportModelModule { }

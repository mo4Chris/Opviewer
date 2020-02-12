import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLoadingComponent } from './ng-loading/ng-loading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NgLoadingComponent],
  bootstrap: [NgLoadingComponent],
  exports: [NgLoadingComponent],
})
export class SupportModelModule { }

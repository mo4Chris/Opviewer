import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '@app/common.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [CommonService],
  declarations: []
})
export class AdminModule { }

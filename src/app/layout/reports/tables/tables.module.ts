import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesComponent } from './tables.component';
import { PageHeaderModule } from '../../../shared';

// modules mongoDB

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CommonService } from '../../../common.service';
import { UserService } from '../../../shared/services/user.service';
import { LongtermModule } from '../longterm/longterm.module';

@NgModule({
    imports: [ HttpClientModule, FormsModule, CommonModule, PageHeaderModule],
    declarations: [TablesComponent, TablesComponent],
    providers: [CommonService, UserService],
    bootstrap: [TablesComponent],
    exports: [TablesComponent]
})
export class TablesModule {}

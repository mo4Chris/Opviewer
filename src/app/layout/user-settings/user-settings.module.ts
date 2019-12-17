import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserSettingsComponent } from './user-settings.component';
import { CommonService } from '../../common.service';
import { AgmCoreModule } from '@agm/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PageHeaderModule, SharedPipesModule } from '../../shared';
import { UserSettingsRoutingModule } from './user-setting-routing.module';

@NgModule({
    imports: [
        HttpClientModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        UserSettingsRoutingModule,
    ],
    declarations: [UserSettingsComponent],
    providers: [CommonService],
    bootstrap: [UserSettingsComponent]
})
export class UserSettingsModule {}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetRequestComponent } from './fleet-request.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { FleetLogRoutingModule } from '../fleet-log/fleet-log-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonService } from '../../common.service';
import { UserTestService } from '../../shared/services/test.user.service';
import { UserService } from '../../shared/services/user.service';

describe('FleetRequestComponent', () => {
    let component: FleetRequestComponent;
    let fixture: ComponentFixture<FleetRequestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                AgmCoreModule.forRoot(),
                HttpModule,
                HttpClientModule,
                FormsModule,
                PageHeaderModule,
                RouterTestingModule,
                BrowserAnimationsModule,
                NgMultiSelectDropDownModule.forRoot(),
              ],
            providers: [CommonService],
            declarations: [FleetRequestComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
        spyOn(FleetRequestComponent.prototype, 'getBoats').and.callFake(() => {
            this.boats = [];
        });
        fixture = TestBed.createComponent(FleetRequestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

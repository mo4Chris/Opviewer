import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetLogComponent } from './fleet-log.component';
import { CommonService } from '../../../common.service';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { PageHeaderModule } from '../../../shared';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FleetLogRoutingModule } from './fleet-log-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../../shared/services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserTestService } from '../../../shared/services/test.user.service';
import { MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';

describe('FleetLogComponent', () => {
    let component: FleetLogComponent;
    let fixture: ComponentFixture<FleetLogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                  AgmCoreModule.forRoot(),
                  HttpModule,
                  HttpClientModule,
                  FormsModule,
                  PageHeaderModule,
                  RouterTestingModule,
                  FleetLogRoutingModule,
                  BrowserAnimationsModule,
                ],
            providers: [MockedCommonServiceProvider],
            declarations: [FleetLogComponent]
        }).compileComponents();

        spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
        spyOn(FleetLogComponent.prototype, 'getCampaignName').and.returnValue('Summer');
        spyOn(FleetLogComponent.prototype, 'getStartDate').and.returnValue(737485);
        spyOn(FleetLogComponent.prototype, 'getWindfield').and.returnValue('Beatrice');
        spyOn(FleetLogComponent.prototype, 'getUsers').and.returnValue([]);
        spyOn(FleetLogComponent.prototype, 'getSailDayChanged').and.callFake(() => {
            this.sailDayChanged = [];
            this.fleetId = '5c8791129bf8eac702a5c75f';
            this.loading = false;
        });
        fixture = TestBed.createComponent(FleetLogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();


    }));


    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
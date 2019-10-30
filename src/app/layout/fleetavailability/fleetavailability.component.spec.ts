import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetavailabilityComponent } from './fleetavailability.component';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { PageHeaderModule } from '../../shared';
import { UserTestService } from '../../shared/services/test.user.service';
import { UserService } from '../../shared/services/user.service';
import { CommonService } from '../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FleetAvailabilityComponent', () => {
  let component: FleetavailabilityComponent;
  let fixture: ComponentFixture<FleetavailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule.forRoot(),
        AgmCoreModule.forRoot(),
        PageHeaderModule,
        RouterTestingModule,
        HttpModule,
        BrowserAnimationsModule
      ],
      providers: [CommonService],
      declarations: [ FleetavailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    spyOn(CommonService.prototype, 'checkUserActive').and.returnValue(Observable.create(true));
    spyOn(FleetavailabilityComponent.prototype, 'getCampaignName').and.returnValue('Summer');
    spyOn(FleetavailabilityComponent.prototype, 'getStartDate').and.returnValue(737485);
    spyOn(FleetavailabilityComponent.prototype, 'getWindfield').and.returnValue('Beatrice');

    fixture = TestBed.createComponent(FleetavailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

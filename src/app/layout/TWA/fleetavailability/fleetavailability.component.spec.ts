import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FleetavailabilityComponent, TurbineWarrentyModel } from './fleetavailability.component';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../../shared';
import { UserTestService } from '../../../shared/services/test.user.service';
import { UserService } from '../../../shared/services/user.service';
import { CommonService } from '../../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockedObservable } from '../../../models/testObservable';
import { MockedCommonService, MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';

describe('FleetAvailabilityComponent', () => {
  let component: FleetavailabilityComponent;
  let fixture: ComponentFixture<FleetavailabilityComponent>;
  const campaign: TurbineWarrentyModel = {
    campaignName: 'Summer',
    startDate: 737485,
    stopDate: 737585,
    client: 'BMO',
    windfield: 'Beatrice',
    fullFleet: ['Seacat_Mischief'],
    activeFleet: ['Seacat_Mischief'],
    numContractedVessels: 1,
    weatherDayTarget: 10,
    weatherDayForecast: 9,
    Dates: [737485, 737486, 737487],
    sailMatrix: [[1, 0, 0]],
    lastUpdated: 737488,
    _id: 'abc'
};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        PageHeaderModule,
        RouterTestingModule,
        HttpClientModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [MockedCommonServiceProvider],
      declarations: [ FleetavailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    spyOn(FleetavailabilityComponent.prototype, 'getCampaignName').and.returnValue(campaign.campaignName);
    spyOn(FleetavailabilityComponent.prototype, 'getStartDate').and.returnValue(campaign.startDate);
    spyOn(FleetavailabilityComponent.prototype, 'getWindfield').and.returnValue(campaign.windfield);
    spyOn(FleetavailabilityComponent.prototype, 'buildData');

    spyOn(CommonService.prototype, 'checkUserActive').and.returnValue(mockedObservable(true));
    spyOn(CommonService.prototype, 'getTurbineWarrantyOne').and.stub();

    fixture = TestBed.createComponent(FleetavailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // This activates the spies
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

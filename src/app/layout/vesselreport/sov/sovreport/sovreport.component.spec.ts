import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { SovreportComponent } from './sovreport.component';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedPipesModule, PageHeaderModule } from '../../../../shared';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { CommonService } from '../../../../common.service';
import { MockedCommonService, MockedCommonServiceProvider } from '../../../../supportModules/mocked.common.service';
import { UserTestService } from '../../../../shared/services/test.user.service';

describe('SovreportComponent', () => {
  let component: SovreportComponent;
  let fixture: ComponentFixture<SovreportComponent>;
  const mockService = new MockedCommonService();
  const SOV = [{
    mmsi: 987654321,
    nicename: 'test SOV'
  }];
  const tokenInfo = {
    admin: UserTestService.getMockedAccessToken({
      userPermission: 'admin',
      userBoats: SOV
    }),
    vesselMaster: UserTestService.getMockedAccessToken({
      userPermission: 'Vessel master',
      userBoats: SOV
    }),
    marineControll: UserTestService.getMockedAccessToken({
      userPermission: 'Marine controller',
      userBoats: SOV
    }),
    logisticSpecialist: UserTestService.getMockedAccessToken({
      userPermission: 'Logistics specialist',
      userBoats: SOV
    }),
  };
  const vesselObject = (token) =>  {
    return {
      date: 737700,
      mmsi: token.userBoats[0].mmsi,
      dateNormal: new Date(2019, 10, 2),
      vesselType: 'OSV',
    };
  };
  const mapPixelWidth = 400;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
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
        RouterTestingModule,
        HttpModule
      ],
      declarations: [ SovreportComponent ],
      providers: [MockedCommonServiceProvider]
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    // spyOn(CommonService.prototype, 'validatePermissionToViewData').and.callFake((mmsi: number) => mockService.validatePermissionToViewData({
    //   mmsi: mmsi,
    //   operationsClass: 'OSV',
    //   vesselname: 'SOV_example'
    // }));
    // spyOn(CommonService.prototype, 'getDatesShipHasSailedForSov').and.callFake(mockService.getDatesShipHasSailedForSov);
    // spyOn(CommonService.prototype, 'getDatesWithTransfersForSOV').and.callFake(mockService.getDatesWithTransfersForSOV);
    // spyOn(CommonService.prototype, 'getSov').and.callFake(mockService.getSov);
    // spyOn(CommonService.prototype, 'getDistinctFieldnames').and.callFake(mockService.getDistinctFieldnames);
    // spyOn(CommonService.prototype, 'getVideoBudgetByMmsi').and.callFake(mockService.getVideoBudgetByMmsi);
    // spyOn(CommonService.prototype, 'getSpecificPark').and.callFake(mockService.getSpecificPark);
    // spyOn(CommonService.prototype, 'getPlatformTransfers').and.callFake(mockService.getPlatformTransfers);
    // spyOn(CommonService.prototype, 'getTurbineTransfers').and.callFake(mockService.getTurbineTransfers);
    // spyOn(CommonService.prototype, 'getVessel2vesselsForSov').and.callFake(mockService.getVessel2vesselsForSov);
    // spyOn(CommonService.prototype, 'getCycleTimesForSov').and.callFake(mockService.getCycleTimesForSov);
    // spyOn(CommonService.prototype, 'getSovDprInput').and.callFake(mockService.getSovDprInput);
    // spyOn(CommonService.prototype, 'getTransitsForSov').and.callFake(mockService.getTransitsForSov);
    // spyOn(CommonService.prototype, 'getPlatformLocations').and.callFake(mockService.getPlatformLocations);
    // spyOn(CommonService.prototype, 'getSovDistinctFieldnames').and.callFake(mockService.getSOVDistinctFieldnames);

    spyOn(SovreportComponent.prototype, 'createOperationalStatsChart');
    spyOn(SovreportComponent.prototype, 'createGangwayLimitationsChart');
    spyOn(SovreportComponent.prototype, 'createWeatherOverviewChart');

    fixture = TestBed.createComponent(SovreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create as admin', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    tick();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as vessel master', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    tick();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as marine controll', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    tick();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as logistic specialist', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    tick();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));
});

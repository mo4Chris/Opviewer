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
  let weatherSpy: jasmine.Spy;

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
    spyOn(SovreportComponent.prototype, 'createOperationalStatsChart');
    spyOn(SovreportComponent.prototype, 'createGangwayLimitationsChart');
    weatherSpy = spyOn(SovreportComponent.prototype, 'createWeatherOverviewChart');

    fixture = TestBed.createComponent(SovreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create as admin', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as vessel master', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as marine controll', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create as logistic specialist', fakeAsync(() => {
    component.vesselObject = vesselObject(tokenInfo.admin);
    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    expect(component).toBeTruthy();
    expect(component.locShowContent).toBe(true);
  }));

  it('should create weather charts', fakeAsync(() => {
    // Allow this specific test to call the weather functionality
    weatherSpy.and.callThrough();
    component.sovModel.sovInfo.weatherConditions = {
      time: [73760.1, 73760.2, 73760.3, 73760.4],
      waveHs: [1.2, 1.3, 1.15, 1.2],
      wavesource: 'TEST',
      waveDirection: [],
      waveTp: [],
      windAvg: [],
      windGust: [],
    };
    component.createWeatherOverviewChart();
    component.locShowContent = true;
    fixture.detectChanges();
    // Tick resolves any promises or timeouts within the period
    tick(1000);
    expect(component).toBeTruthy();
    expect(component.weatherOverviewChart).toBeTruthy();
    expect(component.weatherOverviewChart.Chart).toBeTruthy();
    expect(component.weatherOverviewChart.Chart.canvas).toBeTruthy();
    expect(component.weatherOverviewChartCalculated).toBe(true);
  }));
});

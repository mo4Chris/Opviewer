import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { SovreportComponent } from './sovreport.component';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedPipesModule, PageHeaderModule } from '@app/shared';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { CommonService } from '@app/common.service';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { UserTestService, MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { SovSummaryComponent } from './sov-summary/sov-summary.component';
import { SovDprInputComponent } from './sov-dpr-input/sov-dpr-input.component';
import { SovHseDprInputReadonlyComponent } from './sov-hse-dpr-input/sov-hse-dpr-input-readonly/sov-hse-dpr-input-readonly.component';
import { SovWeatherchartComponent } from './models/sov-weatherchart/sov-weatherchart.component';
import { WaveSpectrumComponentComponent } from './models/wave-spectrum-component/wave-spectrum-component.component';
import { SovTurbineTransfersComponent } from './sov-turbine-transfers/sov-turbine-transfers.component';
import { SovPlatformTransfersComponent } from './sov-platform-transfers/sov-platform-transfers.component';
import { SovV2vTransfersComponent } from './sov-v2v-transfers/sov-v2v-transfers.component';
import { SovHseDprInputVesselmasterComponent } from './sov-hse-dpr-input/sov-hse-dpr-input-vesselmaster/sov-hse-dpr-input-vesselmaster.component';
import { SovDprInputReadonlyComponent } from './sov-dpr-input/sov-dpr-input-readonly/sov-dpr-input-readonly.component';
import { SovDprInputVesselmasterComponent } from './sov-dpr-input/sov-dpr-input-vesselmaster/sov-dpr-input-vesselmaster.component';
import { AutosizeModule } from 'ngx-autosize';
import { PlotlyModule } from 'angular-plotly.js';
import { UserService } from '@app/shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { TokenModel } from '@app/models/tokenModel';

describe('SovreportComponent', () => {
  let component: SovreportComponent;
  let fixture: ComponentFixture<SovreportComponent>;
  const mockService = new MockedCommonService();
  const SOV = [{
    mmsi: 987654321,
    nicename: 'test SOV'
  }];
  // const tokenInfo = {
  //   admin: UserTestService.getMockedAccessToken({
  //     userPermission: 'admin',
  //     userBoats: SOV
  //   }),
  //   vesselMaster: UserTestService.getMockedAccessToken({
  //     userPermission: 'Vessel master',
  //     userBoats: SOV
  //   }),
  //   marineControll: UserTestService.getMockedAccessToken({
  //     userPermission: 'Marine controller',
  //     userBoats: SOV
  //   }),
  //   logisticSpecialist: UserTestService.getMockedAccessToken({
  //     userPermission: 'Logistics specialist',
  //     userBoats: SOV
  //   }),
  // };
  const vesselObject = (token) =>  {
    return {
      date: 737700,
      mmsi: 987654321, // token.userBoats[0].mmsi,
      dateNormal: new Date(2019, 10, 2),
      vesselType: 'OSV',
    };
  };
  // let weatherSpy: jasmine.Spy;
  // let opsChartSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AgmCoreModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        RouterTestingModule,
        AutosizeModule,
        PlotlyModule,
      ],
      declarations: [
        SovreportComponent,
        SovSummaryComponent,
        SovDprInputComponent,
        SovDprInputReadonlyComponent,
        SovDprInputVesselmasterComponent,

        SovHseDprInputReadonlyComponent,
        SovHseDprInputVesselmasterComponent,

        SovWeatherchartComponent,
        WaveSpectrumComponentComponent,
        SovTurbineTransfersComponent,
        SovPlatformTransfersComponent,
        SovV2vTransfersComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(async(() => {

    fixture = TestBed.createComponent(SovreportComponent);
    component = fixture.componentInstance;
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: null
    });
    component.vesselObject = {
      date: 737700,
      mmsi: 987654321,
      vesselType: 'OSV'
    };
    fixture.detectChanges();
  }));

  it('Should instantiate', (done) => {
    expect(component).toBeTruthy();
    expect(component.alert).toBeTruthy();
    expect(component.permission).toBeTruthy();
    done();
  });

  it('Should run ngOnChanges', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    done();
  });

  it('should create as admin', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('admin');

    component.ngOnChanges();

    defaultTestLoaded(component);
    expect(component.waveSpectrumAvailable).toBe(true);
    done();
  });

  it('should create as Vessel master', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Vessel master');

    component.ngOnChanges();

    defaultTestLoaded(component);
    expect(component.waveSpectrumAvailable).toBe(false);
    done();
  });

  it('should create as Marine controller', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Marine controller');

    component.ngOnChanges();

    defaultTestLoaded(component);
    done();
  });

  it('should create as QHSE specialist', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('QHSE specialist');

    component.ngOnChanges();

    defaultTestLoaded(component);
    done();
  });

  it('should create as Logistics specialist', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Logistics specialist');

    component.ngOnChanges();

    defaultTestLoaded(component);
    done();
  });

  it('should create as Client representative', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Client representative');

    component.ngOnChanges();

    defaultTestLoaded(component);
    done();
  });
});

function defaultTestLoaded(component: SovreportComponent) {
  expect(component).toBeTruthy();
  expect(component.showContent).toBe(true);
  expect(component.sovModel).toBeTruthy();
  expect(component.sovModel.transits).toBeDefined();
  expect(component.sovModel.turbineTransfers).toBeDefined();
  expect(component.sovModel.platformTransfers).toBeDefined();
  expect(component.sovModel.summary).toBeDefined();
  expect(component.sovModel.sovInfo).toBeDefined();
  expect(component.sovModel.sovType).toBeGreaterThanOrEqual(0); // Defined and valid value
}

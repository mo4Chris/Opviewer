import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { SovreportComponent } from './sovreport.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedPipesModule, PageHeaderModule } from '@app/shared';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
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
import { PermissionService } from '@app/shared/permissions/permission.service';
import { SupportModelModule } from '@app/models/support-model.module';
import { SimpleChange } from '@angular/core';
import { SovDcTransfersComponent } from './sov-dc-transfers/sov-dc-transfers.component';
import { SovRovOperationsComponent } from './sov-rov-operations/sov-rov-operations.component';
import { MockComponent, MockComponents } from 'ng-mocks';
import { DprMapComponent } from '../map/dpr-map/dpr-map.component';

describe('SovreportComponent', () => {
  let component: SovreportComponent;
  let fixture: ComponentFixture<SovreportComponent>;
  const fakeSimpleChange = {change: new SimpleChange(null, 1, true)};

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
        SupportModelModule,
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
        MockComponents(SovRovOperationsComponent, DprMapComponent),
        SovWeatherchartComponent,
        WaveSpectrumComponentComponent,
        SovTurbineTransfersComponent,
        SovPlatformTransfersComponent,
        SovV2vTransfersComponent,
        SovDcTransfersComponent,
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
      vesselType: 'OSV',
      vesselName: 'TEST SOV'
    };
    fixture.detectChanges();
  }));

  it('Should instantiate', () => {
    expect(component).toBeTruthy();
    expect(component.alert).toBeTruthy();
    expect(component.permission).toBeTruthy();
  });

  it('Should run ngOnChanges', () => {
    component.ngOnChanges(fakeSimpleChange);
    expect(component).toBeTruthy();
  });

  it('should create as admin', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('admin');

    component.ngOnChanges(fakeSimpleChange);

    defaultTestLoaded(component);
    expect(component.waveSpectrumAvailable).toBe(true);
    done();
  });

  it('should create as Vessel master', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Vessel master');

    component.ngOnChanges(fakeSimpleChange);

    defaultTestLoaded(component);
    expect(component.waveSpectrumAvailable).toBe(false);
    done();
  });

  it('should create as Marine controller', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Marine controller');

    component.ngOnChanges(fakeSimpleChange);

    defaultTestLoaded(component);
    done();
  });

  it('should create as Qhse specialist', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Qhse specialist');

    component.ngOnChanges(fakeSimpleChange);

    defaultTestLoaded(component);
    done();
  });

  it('should create as Logistics specialist', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Logistics specialist');

    component.ngOnChanges(fakeSimpleChange);

    defaultTestLoaded(component);
    done();
  });

  it('should create as Client representative', (done) => {
    component.tokenInfo = UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    });
    component.permission = <PermissionService> PermissionService.getDefaultPermission('Client representative');

    component.ngOnChanges(fakeSimpleChange);

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

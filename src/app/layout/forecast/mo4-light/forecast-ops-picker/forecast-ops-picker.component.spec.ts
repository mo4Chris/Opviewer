import { CommonModule } from '@angular/common';
import { SimpleChange } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { mockedObservable } from '@app/models/testObservable';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastExpectedResponsePreference } from '../../models/forecast-response.model';
import { ForecastOpsPickerUtilsService } from './forecast-ops-picker-utils.service';
import { ForecastOpsPickerComponent } from './forecast-ops-picker.component';

describe('ForecastOpsPickerComponent', () => {
  let component: ForecastOpsPickerComponent;
  let fixture: ComponentFixture<ForecastOpsPickerComponent>;
  beforeEach(waitForAsync(() => {
    const forecastOpsPickerUtilsServiceMock = jasmine.createSpyObj('ForecastOpsPickerUtilsService', ['shouldDisableAddButton', 'shouldShowSlipSettings', 'shouldShowOperationSettingsOptions'])
    TestBed.configureTestingModule({
      declarations: [
        ForecastOpsPickerComponent,
      ],
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        {provide: ForecastOpsPickerUtilsService, useValue: forecastOpsPickerUtilsServiceMock},
        MockedUserServiceProvider,
        MockedCommonServiceProvider,
        {provide: ForecastOpsPickerUtilsService, useValue: forecastOpsPickerUtilsServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastOpsPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit on change', () => {
    const emitter = spyOn(component['routerService'], 'routeToForecast');
    component.projects = [{
      id: 0,
      nicename: 'TESTY',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 213,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: null,
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }];
    component.selectedProjectId = 0;
    component.ngOnChanges({selectedProjectId: new SimpleChange(null, 0, true)});
    fixture.detectChanges();
    expect(component.hasSelectedOperation).toBeTruthy();

    const select = fixture.nativeElement.querySelector('select');
    expect(select).not.toBeNull('Select should be present');
    if (select) {
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(emitter).toHaveBeenCalled();
    }
  });

  it('should render relevant data', async () => {
    component.projects = [{
      id: 0,
      nicename: 'TESTY',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 123,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: null,
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }];
    component.selectedProjectId = 0;
    component.ngOnChanges();
    fixture.detectChanges();
    await fixture.whenStable();

    const elt: HTMLElement = fixture.nativeElement;
    const opt = elt.querySelector('#selectOperation');
    expect(opt).toBeTruthy();
  });

  it('should save on changes', () => {
    const saveSpy = spyOn(MockedCommonService.prototype, 'saveForecastProjectSettings').and.returnValue(
      mockedObservable(null)
    )
    component.selectedProject ={
      id: 0,
      nicename: 'BOOOOOOOOOOOJ',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 123,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: mockClientPreferences(),
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }
    component.onConfirm();
    expect(saveSpy).toHaveBeenCalled();
  })

  it('should correctly get ctvSlipSettings', () => {
    component.projects = [{
      id: 0,
      nicename: 'BOOOOOOOOOOOJ',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 123,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: mockClientPreferences(),
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }]
    component.selectedProjectId = 0;
    component.ngOnChanges({
      projects: new SimpleChange(null, null, true),
      selectedProjectId: new SimpleChange(null, 0, true),
    })
    expect(component.ctvSlipSettings?.Max_Allowed_Slip_Meter).toEqual(2)
  })

  it('should correctly get timeValid', () => {
    component.startTime = 737700.2;
    component.stopTime = 737700.4;
    expect(component.timeValid).toBe(true);
    component.stopTime = 737700;
    expect(component.timeValid).toBe(false);
  })

  it('should correctly get the selectedVesselName', () => {
    component.projects = [{
      id: 0,
      nicename: 'BOOOOOOOOOOOJ',
      name: 'string',
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: 123,
      activation_start_date: '6',
      activation_end_date: '7',
      client_preferences: mockClientPreferences(),
      consumer_id: 8,
      analysis_types: ['Standard'],
      metocean_provider: {
        id: 1,
        name: 'test',
        display_name: 'Test 1',
        is_active: true,
      }
    }]
    component.vessels = [{
      id: 123,
      client_id: 1,
      length: 100,
      width: 30,
      draft: 20,
      gm: 1,
      nicename: 'Cool vessel name',
      type: 'Typo',
      rao: null,
      analysis_types: ['Standard']
    }]
    component.selectedProjectId = 0;
    expect(component.selectedVesselName).toEqual('N/a')
    component.ngOnChanges({
      projects: new SimpleChange(null, null, true),
      selectedProjectId: new SimpleChange(null, 0, true),
    })
    expect(component.selectedVesselName).toEqual('Cool vessel name')
  })

  it('should get settingsChanged', () => {
    expect(component.settingsChanged).toBe(false)
    component.heading = 540;
    component.onHeadingChange();
    expect(component.settingsChanged).toBe(true)
    expect(component.heading).toEqual(180);
  })

  it('should format thrust', () => {
    const formatted = component.formatThrust(10000);
    expect(formatted).toEqual('10kN')
  })


  describe('updateOperationsTime', () => {
    // 737700 is 02-10-2019
    it('should correctly compute start / stop time for up-to-date data', () => {
      spyOn(DatetimeService.prototype, 'getCurrentMatlabDatenum').and.returnValue(737700 + 4/24);
      component.minForecastDate = {year: 2019, month: 10, day: 2};
      component.maxForecastDate = {year: 2019, month: 10, day: 7};
      component.startTimeInput = {hour: 3, mns: 0};
      component.stopTimeInput = {hour: 8, mns: 0};
      component['updateOperationTimes'](true);
      expect(component.formattedDuration).toEqual('05:00:00')
      expect(component.startTime).toBeCloseTo(737700 + 3/24, 4);
      expect(component.stopTime).toBeCloseTo(737700 + 8/24, 4);
    })

    it('should correctly compute start / stop time for up-to-date data (next day)', () => {
      spyOn(DatetimeService.prototype, 'getCurrentMatlabDatenum').and.returnValue(737700 + 10/24);
      component.minForecastDate = {year: 2019, month: 10, day: 2};
      component.maxForecastDate = {year: 2019, month: 10, day: 7};
      component.startTimeInput = {hour: 3, mns: 0};
      component.stopTimeInput = {hour: 8, mns: 0};
      component['updateOperationTimes'](true);
      expect(component.formattedDuration).toEqual('05:00:00')
      expect(component.startTime).toBeCloseTo(737701+ 3/24, 4);
      expect(component.stopTime).toBeCloseTo(737701 + 8/24, 4);
    })

    it('should correctly compute start / stop time for outdated data', () => {
      spyOn(DatetimeService.prototype, 'getCurrentMatlabDatenum').and.returnValue(737709 + 10/24);
      component.minForecastDate = {year: 2019, month: 10, day: 2}; // 737700
      component.maxForecastDate = {year: 2019, month: 10, day: 7}; // 737705
      component.startTimeInput = {hour: 3, mns: 0};
      component.stopTimeInput = {hour: 8, mns: 0};
      component['updateOperationTimes'](true);
      expect(component.formattedDuration).toEqual('05:00:00')
      expect(component.startTime).toBeCloseTo(737700 + 3/24, 4);
      expect(component.stopTime).toBeCloseTo(737700 + 8/24, 4);
    })

    it('should correctly compute start / stop time for stop < start time', () => {
      spyOn(DatetimeService.prototype, 'getCurrentMatlabDatenum').and.returnValue(737700 + 10/24);
      component.minForecastDate = {year: 2019, month: 10, day: 2};
      component.maxForecastDate = {year: 2019, month: 10, day: 7}; // 737705
      component.startTimeInput = {hour: 9, mns: 30};
      component.stopTimeInput = {hour: 8, mns: 0};
      component['updateOperationTimes'](true);
      expect(component.formattedDuration).toEqual('22:30:00')
      expect(component.startTime).toBeCloseTo(737700 + 9.5/24, 4);
      expect(component.stopTime).toBeCloseTo(737701 + 8/24, 4);
    })

    it('should correctly compute start / stop time when a different date is selected', () => {
      spyOn(DatetimeService.prototype, 'getCurrentMatlabDatenum').and.returnValue(737700 + 10/24);
      component.minForecastDate = {year: 2019, month: 10, day: 2};
      component.maxForecastDate = {year: 2019, month: 10, day: 7}; // 737705
      component.startTimeInput = {hour: 9, mns: 30};
      component.stopTimeInput = {hour: 8, mns: 0};
      component.date = {
        year: 2019,
        month: 10,
        day: 5,
      }
      component['updateOperationTimes'](false);
      expect(component.formattedDuration).toEqual('22:30:00')
      expect(component.startTime).toBeCloseTo(737703 + 9.5/24, 4);
      expect(component.stopTime).toBeCloseTo(737704 + 8/24, 4);
    })
  })


  it('should show save button', () => {
    component.onHeadingChange();
    fixture.detectChanges();
    const btn1 = locate('button');
    expect(component.isSampleProject).toBe(false);
    expect(btn1).toBeTruthy();
  })

  it('should only save changes for sample project as admin', async () => {
    const spy = spyOn(MockedCommonService.prototype, 'saveForecastProjectSettings').and.returnValue(mockedObservable(null));
    component.permission.admin = false;
    fixture.detectChanges();
    const SAMPLE_PROJECT_NAME = 'sample_project';
    component.projects = [{
      id: component['project_id'],
      activation_end_date: "2021-06-27T09:36:30.052000+00:00",
      activation_start_date: "2041-05-27T09:36:30.052000+00:00",
      analysis_types: ["Standard"],
      client_id: 4,
      client_preferences: <any> {},
      latitude: 52,
      longitude: 3,
      maximum_duration: 60,
      metocean_provider: {id: 20, name: "infoplaza", display_name: "INFOPLAZA", is_active: true},
      name: SAMPLE_PROJECT_NAME,
      nicename: "Demo project",
      vessel_id: 2,
      water_depth: 20,
    }];
    component.onNewSelectedOperation();
    component.onHeadingChange();
    expect(component.isSampleProject).toBe(true);
    fixture.detectChanges();
    let btn = <HTMLButtonElement> locate('button');
    await btn.click();
    await fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).not.toHaveBeenCalled();

    component.onHeadingChange();
    component.permission.admin = true;
    fixture.detectChanges();
    btn = <HTMLButtonElement> locate('button');
    await btn.click();
    await fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalled();
  })


  function locate(locator: string) {
    const nativeElt = <HTMLElement> fixture.nativeElement;
    return nativeElt.querySelector(locator);
  }
});


function mockClientPreferences(): ForecastExpectedResponsePreference {
  return {
    Points_Of_Interest: {
      P1: {
        Degrees_Of_Freedom: null,
        Coordinates: {
          X: {Data: 0, String_Value: ''},
          Y: {Data: 0, String_Value: ''},
          Z: {Data: 0, String_Value: ''}
        },
        Max_Type: 'MPM'
      },
    },
    Limits: [],
    Max_Type: 'MPM',
    Ops_Start_Time: '03:12',
    Ops_Stop_Time: '11:23',
    Ops_Heading: 210,
    Points: [],
    Ctv_Slip_Options: {
      Max_Allowed_Slip_Meter: 2,
      Slip_Coefficient: 0.7,
      Thrust_Level_N: 10000,
      Window_Length_Seconds: 120,
    }
  }
}

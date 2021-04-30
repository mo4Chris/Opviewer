import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonService } from '@app/common.service';
import { mockedObservable } from '@app/models/testObservable';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastExpectedResponsePreference } from '../../models/forecast-response.model';
import { ForecastOpsPickerComponent } from './forecast-ops-picker.component';

describe('ForecastOpsPickerComponent', () => {
  let component: ForecastOpsPickerComponent;
  let fixture: ComponentFixture<ForecastOpsPickerComponent>;

  beforeEach(waitForAsync(() => {
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
        MockedUserServiceProvider,
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastOpsPickerComponent);
    component = fixture.componentInstance;
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
    }];
    component.selectedProjectId = 0;
    component.ngOnChanges();
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
    }
    component.onConfirm();
    expect(saveSpy).toHaveBeenCalled();
  })
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

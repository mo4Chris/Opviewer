import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForecastOpsPickerComponent } from './forecast-ops-picker.component';

describe('ForecastOpsPickerComponent', () => {
  let component: ForecastOpsPickerComponent;
  let fixture: ComponentFixture<ForecastOpsPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ForecastOpsPickerComponent,
      ],
      imports: [
        NgbModule,
        CommonModule,
        FormsModule
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
    let emitter = spyOn(component['routerService'], 'routeToForecast');
    component.projects = [{ 
      id: 0,
      name: "string",
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: "string",
      activation_start_date: "6",
      activation_end_date: "7",
      client_preferences: null,
      consumer_id: 8,
    }];
    component.ngOnChanges();
    fixture.detectChanges();
    expect(component.hasSelectedOperation).toBeTruthy();

    let select = fixture.nativeElement.querySelector('select');
    expect(select).not.toBeNull('Select should be present')
    if (select) {
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(emitter).toHaveBeenCalled();
    }
  })

  it('should render relevant data', () => {
    component.projects = [{ 
      id: 0,
      name: "string",
      client_id: 1,
      latitude: 2,
      longitude: 3,
      water_depth: 4,
      maximum_duration: 5,
      vessel_id: "string",
      activation_start_date: "6",
      activation_end_date: "7",
      client_preferences: null,
      consumer_id: 8,
    }];
    component.ngOnChanges();
    fixture.detectChanges();

    let opt = fixture.nativeElement.querySelector('option');
    expect(opt).toBeTruthy();
    expect(opt.value).toBeTruthy(); // We get [object object] here, not sure how to access the actual element
  })
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MockComponents } from 'ng-mocks';
import { HeadingPickerComponent } from '../models/heading-picker/heading-picker.component';
import { ForecastLimitsPickerComponent } from './forecast-limits-picker/forecast-limits-picker.component';
import { ForecastOpsPickerComponent } from './forecast-ops-picker/forecast-ops-picker.component';
import { ForecastWorkabilityComponent } from './forecast-workability/forecast-workability.component';
import { Mo4testComponent } from './mo4test.component';

describe('Mo4testComponent', () => {
  let component: Mo4testComponent;
  let fixture: ComponentFixture<Mo4testComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        FormsModule,
        SupportModelModule,
        NgbDatepickerModule,
      ],
      declarations: [
        Mo4testComponent,
        MockComponents(
          ForecastOpsPickerComponent,
          HeadingPickerComponent,
          ForecastLimitsPickerComponent,
          ForecastWorkabilityComponent
        )
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4testComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.showContent).toBe(false);
    
    let loadSpy = spyOn(component, 'loadData').and.callThrough();
    fixture.detectChanges();
    expect(loadSpy).toHaveBeenCalled();
    expect(component.showContent).toBe(true);
  });
});

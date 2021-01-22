import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
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
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4testComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

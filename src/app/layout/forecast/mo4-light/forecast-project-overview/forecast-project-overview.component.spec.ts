import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastProjectOverviewComponent } from './forecast-project-overview.component';
import { MockComponents } from 'ng-mocks';
import { ForecastOpsPickerComponent } from '../forecast-ops-picker/forecast-ops-picker.component';

describe('ForecastProjectOverviewComponent', () => {
  let component: ForecastProjectOverviewComponent;
  let fixture: ComponentFixture<ForecastProjectOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastProjectOverviewComponent, MockComponents(ForecastOpsPickerComponent)
 ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastProjectOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

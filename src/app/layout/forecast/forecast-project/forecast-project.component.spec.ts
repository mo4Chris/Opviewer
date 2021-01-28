import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastProjectComponent } from './forecast-project.component';

fdescribe('ForecastProjectComponent', () => {
  let component: ForecastProjectComponent;
  let fixture: ComponentFixture<ForecastProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastVesselComponent } from './forecast-project.component';

fdescribe('ForecastProjectComponent', () => {
  let component: ForecastVesselComponent;
  let fixture: ComponentFixture<ForecastVesselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastVesselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

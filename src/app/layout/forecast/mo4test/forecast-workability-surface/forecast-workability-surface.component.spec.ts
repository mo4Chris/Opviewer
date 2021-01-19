import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastWorkabilitySurfaceComponent } from './forecast-workability-surface.component';

describe('ForecastWorkabilitySurfaceComponent', () => {
  let component: ForecastWorkabilitySurfaceComponent;
  let fixture: ComponentFixture<ForecastWorkabilitySurfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastWorkabilitySurfaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWorkabilitySurfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

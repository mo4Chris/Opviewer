import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastNewProjectComponent } from './forecast-new-project.component';

describe('ForecastNewProjectComponent', () => {
  let component: ForecastNewProjectComponent;
  let fixture: ComponentFixture<ForecastNewProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastNewProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastNewProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

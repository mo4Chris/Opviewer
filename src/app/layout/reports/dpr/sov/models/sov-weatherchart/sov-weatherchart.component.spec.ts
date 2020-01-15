import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovWeatherchartComponent } from './sov-weatherchart.component';

describe('SovWeatherchartComponent', () => {
  let component: SovWeatherchartComponent;
  let fixture: ComponentFixture<SovWeatherchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovWeatherchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovWeatherchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

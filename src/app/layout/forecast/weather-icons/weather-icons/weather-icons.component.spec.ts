import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherIconsComponent } from './weather-icons.component';

describe('WeatherIconsComponent', () => {
  let component: WeatherIconsComponent;
  let fixture: ComponentFixture<WeatherIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherIconsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

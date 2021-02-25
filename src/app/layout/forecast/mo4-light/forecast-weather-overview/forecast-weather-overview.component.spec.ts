import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockComponent } from 'ng-mocks';
import { WeatherOverviewComponent } from '../../models/weather-overview/weather-overview.component';
import { ForecastWeatherOverviewComponent } from './forecast-weather-overview.component';

describe('ForecastWeatherOverviewComponent', () => {
  let component: ForecastWeatherOverviewComponent;
  let fixture: ComponentFixture<ForecastWeatherOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SupportModelModule,
      ],
      declarations: [
        ForecastWeatherOverviewComponent,
        MockComponent(WeatherOverviewComponent)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastWeatherOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(getLoadingRef()).toBeTruthy();
  });
  it('should render when loading is done', () => {
    component.weather = {
      source: 'test',
      timeStamp: [],
      Hs: [],
    }
    component.ngOnChanges();
    fixture.detectChanges();
    expect(component.source).toEqual('test')
    expect(getLoadingRef()).toBeFalsy();
  });

  function getLoadingRef() {
    const elt = <HTMLElement> fixture.nativeElement;
    return elt.querySelector('app-ng-loading')
  }
});

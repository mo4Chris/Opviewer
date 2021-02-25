import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { exec } from 'child_process';
import { WeatherOverviewComponent } from './weather-overview.component';

fdescribe('WeatherOverviewComponent', () => {
  let component: WeatherOverviewComponent;
  let fixture: ComponentFixture<WeatherOverviewComponent>;
  const dateMin = 737700;
  const dateMax = 737702;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherOverviewComponent ],
      providers: [
        MockedUserServiceProvider,
        MockedCommonServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(console, 'error').and.callFake((errorMsg: string) => {
      // Expectation runs (and fails) if and only if an error is thrown to the console
      console.groupCollapsed(`%cError: ${errorMsg}`, 'color: red');
      console.trace(); // hidden in collapsed group
      console.groupEnd();
      expect(console.error).not.toHaveBeenCalled();
    })
  })

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(getCanvasIsVisible()).toBeFalsy();
  });

  it('should render', async () => {
    const N = 49;
    component.source = 'test';
    component.weather = {
      source: 'Not used',
      timeStamp: linspace(dateMin, dateMax, N),
      Hs: linspace(1, 2, N),
      Tp: linspace(1, 2, N),
      waveDir: linspace(1, 2, N),
      windSpeed: linspace(1, 2, N),
      windDir: linspace(1, 2, N),
    }
    component.ngOnChanges();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(getCanvasIsVisible()).toBeTruthy();
  });

  function getNativeRef() {
    return <HTMLElement> fixture.nativeElement;
  }
  function getCanvasIsVisible() {
    const elt = getNativeRef();
    const canvas = <HTMLElement> elt.querySelector('.weatherOverview');
    return !canvas?.hidden
  }
});


function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}
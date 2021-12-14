import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { RawWaveData } from '@app/models/wavedataModel';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MatrixService } from '@app/supportModules/matrix.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotlyModule } from 'angular-plotly.js';
import { SovWaveSpectrumComponent } from './wave-spectrum.component';

describe('WaveSpectrumComponent', () => {
  let component: SovWaveSpectrumComponent;
  let fixture: ComponentFixture<SovWaveSpectrumComponent>;
  const matService = new MatrixService()

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SovWaveSpectrumComponent ],
      imports: [
        PlotlyModule,
        SupportModelModule,
        CommonModule,
        NgbModule
      ],
      providers: [
        MockedUserServiceProvider,
        MockedCommonServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovWaveSpectrumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    const updateSpy = spyOn(component, 'plotViaIndex').and.callThrough();
    expect(component).toBeTruthy();
    mockSpectrumComponent(component);
    component.ngOnChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should update on changed index', () => {
    const updateSpy = spyOn(component, 'plotViaIndex');
    component.onSliderChange({step: {_index: 3}});
    expect(updateSpy).toHaveBeenCalled();
    expect(component.spectrumIndex).toEqual(3);
  });

  it('not fail on missing waveDir', async () => {
    mockSpectrumComponent(component);
    component.weather.waveDir = null;
    component.ngOnChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('not fail on missing wavePeakDir', async () => {
    mockSpectrumComponent(component);
    component.weather.wavePeakDir = null;
    component.ngOnChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('not render on missing spectrum', async () => {
    mockSpectrumComponent(component);
    component.spectrum = null;
    component.ngOnChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.spectrumValid).toBe(false);
  });

  function mockSpectrumComponent(component: SovWaveSpectrumComponent) {
    const numTimeSteps = 25;
    const numKSteps = 25;
    component.time = linspace(737700, 737701, numTimeSteps),
    component.k_x = linspace(-28.9, 28.9, numKSteps);
    component.k_y = linspace(-28.9, 28.9, numKSteps);
    component.weather = mockWeather(numTimeSteps);
    component.spectrum = component.time.map(t => matService.random(numKSteps, numKSteps));
  }
});

function linspace(s, e, n) {
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    y[i] = s + (e - s) * i / (n - 1);
  }
  return y;
}

function mockWeather(numTimeSteps = 25): RawWaveData {
  return {
    source: 'Dodgy',
    timeStamp: linspace(737700, 737701, numTimeSteps),
    waveDir: linspace(200, 300, numTimeSteps),
    wavePeakDir: linspace(210, 310, numTimeSteps),
    Hs: linspace(1, 3, numTimeSteps),
  }
}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WaveSpectrumComponentComponent } from './wave-spectrum-component.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

describe('WaveSpectrumComponent', () => {
  let component: WaveSpectrumComponentComponent;
  let fixture: ComponentFixture<WaveSpectrumComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PlotlyModule,
        SupportModelModule,
      ],
      declarations: [ WaveSpectrumComponentComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveSpectrumComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.vesselObject = {
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      dateNormal: '',
      vesselName: '',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should run ngOnChanges', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    done();
  });
});

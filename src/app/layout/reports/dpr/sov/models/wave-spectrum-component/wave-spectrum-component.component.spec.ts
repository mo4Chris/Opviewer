import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WaveSpectrumComponentComponent } from './wave-spectrum-component.component';
import { PlotlyViaCDNModule } from 'angular-plotly.js';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('WaveSpectrumComponent', () => {
  let component: WaveSpectrumComponentComponent;
  let fixture: ComponentFixture<WaveSpectrumComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        PlotlyViaCDNModule,
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

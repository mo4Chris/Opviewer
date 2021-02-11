import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { SovWeatherchartComponent } from './sov-weatherchart.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { SovModel } from '../SovModel';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { HttpClientModule } from '@angular/common/http';

describe('SovWeatherchartComponent', () => {
  let component: SovWeatherchartComponent;
  let fixture: ComponentFixture<SovWeatherchartComponent>;
  const mockedCommonService = new MockedCommonService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        SupportModelModule,
        HttpClientModule,
      ],
      declarations: [
        SovWeatherchartComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'setTimeout');

    fixture = TestBed.createComponent(SovWeatherchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.sovModel = new SovModel();
    mockedCommonService.getSov({
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      vesselName: 'TEST SOV'
    }).subscribe(val => {
      component.sovModel.sovInfo = val[0];
    });
  });

  it('should instantiate', () => {
    expect(component).toBeTruthy();
  });

  it('Should run ngOnChanges', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    done();
  });
});

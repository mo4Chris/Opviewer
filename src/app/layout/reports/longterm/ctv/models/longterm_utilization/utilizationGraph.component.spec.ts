import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { CtvUtilizationGraphComponent } from './utilizationGraph.component';
import { CtvLongtermUtilSubGraphComponent } from './longterm-util-sub-graph/longterm-util-sub-graph.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

describe('CTV utilization graph', () => {
  let component: CtvUtilizationGraphComponent;
  let fixture: ComponentFixture<CtvUtilizationGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      declarations: [
        CtvUtilizationGraphComponent,
        CtvLongtermUtilSubGraphComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvUtilizationGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should created w/out vessels', () => {
    component.vesselObject = {
      dateMin: 737000,
      dateMax: 737100,
      mmsi: [],
      vesselName: [],
      dateNormalMin: '',
      dateNormalMax: '',
    };
    component.fromDate = new NgbDate(2019, 1, 1);
    component.toDate = new NgbDate(2019, 2, 1);
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.noData).toBe(true);
  });

  it('should create with 1 vessel', () => {
    expect(component).toBeTruthy();
    component.vesselObject = {
      dateMin: 737000,
      dateMax: 737100,
      mmsi: [123456789],
      vesselName: ['Test CTV'],
      dateNormalMin: '',
      dateNormalMax: '',
    };
    component.fromDate = new NgbDate(2019, 1, 1);
    component.toDate = new NgbDate(2019, 2, 1);
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.noData).toBe(true);
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermScatterGraphComponent } from './longterm-scatter-graph.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

describe('LongtermScatterGraphComponent', () => {
  let component: LongtermScatterGraphComponent;
  let fixture: ComponentFixture<LongtermScatterGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermScatterGraphComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermScatterGraphComponent);
    component = fixture.componentInstance;
    component.data = {
      x: 'Hs',
      y: 'Hs',
      xLabel: 'Hs',
      yLabel: 'Hs',
      graph: 'trend',
      info: 'Hello!',
      dataType: 'transfer',
    };
    component.fromDate = new NgbDate(2020, 1, 1);
    component.toDate =  new NgbDate(2020, 2, 1);
    component.vesselType = 'CTV';
    component.vesselObject = {
      mmsi: [123456789],
      vesselName: ['Test CTV'],
      dateMin: 737791,
      dateMax: 737822,
      dateNormalMin: '2020-01-01',
      dateNormalMax: '2020-02-01',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
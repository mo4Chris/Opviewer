import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { FuelAverageOverviewGraphComponent } from './fuel-average-overview-graph/fuel-average-overview-graph.component';

import { FuelAverageOverviewComponent } from './fuel-average-overview.component';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

describe('FuelAverageOverviewComponent', () => {
  let component: FuelAverageOverviewComponent;
  let fixture: ComponentFixture<FuelAverageOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        FuelAverageOverviewComponent,
        FuelAverageOverviewGraphComponent
       ],
       providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelAverageOverviewComponent);
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
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.noData).toBe(false);
  });
});

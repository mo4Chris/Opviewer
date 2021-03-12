import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { FuelAverageOverviewComponent } from '../fuel-average-overview.component';

import { FuelAverageOverviewGraphComponent } from './fuel-average-overview-graph.component';

describe('FuelAverageOverviewGraphComponent', () => {
  let component: FuelAverageOverviewGraphComponent;
  let fixture: ComponentFixture<FuelAverageOverviewGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        FuelAverageOverviewGraphComponent,
        FuelAverageOverviewComponent 
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelAverageOverviewGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create first vessel', () => {

    component.dateMin = 738126;
    component.dateMax = 738169;
    component.dset = {
      labels : [
        'Tue Dec 01 2020 01:00:00 GMT+0100 (Central European Standard Time)',
        'Wed Dec 02 2020 01:00:00 GMT+0100 (Central European Standard Time)'
      ],
      isFirst: true,
      datasets : [{
        stack: ''
      }]
    };
    expect(component).toBeTruthy();
  });

  it('should create not-first vessel', () => {

    component.dateMin = 738126;
    component.dateMax = 738169;
    component.dset = {
      labels : [
        'Tue Dec 01 2020 01:00:00 GMT+0100 (Central European Standard Time)',
        'Wed Dec 02 2020 01:00:00 GMT+0100 (Central European Standard Time)'
      ],
      isFirst: false,
      datasets : [{
        stack: ''
      }]
    };
    expect(component).toBeTruthy();
  });

  it('should create without data', () => {
    expect(component.hasData).toBe(false);
    expect(component).toBeTruthy();
  });
});



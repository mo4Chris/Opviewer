import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsRangeRequest } from '@app/common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

import { EngineOverviewComponent } from './engine-overview.component';

describe('EngineOverviewComponent', () => {
  let component: EngineOverviewComponent;
  let fixture: ComponentFixture<EngineOverviewComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
      ],
      declarations: [
        EngineOverviewComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with minimal data', () => {
    component.vesselObject = {
      dateMin: 737700,
      dateMax: 737800,
      dateNormalMin: '',
      dateNormalMax: '',
      vesselName: ['TEST CTV'],
      mmsi: [123456789],
    };
    expect(component.hasData).toBe(false);
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.engines.length).toBeGreaterThan(0);
    expect(component.hasData).toBe(true);
  });
});

// function makeRequest(mmsi?: number): StatsRangeRequest {
//   let request = {
//     dateMin: 737000,
//     dateMax: 738000,
//     mmsi: [mmsi] || [123456789],
//     reqFields: ['fuelPerHourDepart', 'fuelPerHourReturn', 'fuelUsedTotalM3', 'co2TotalKg']
//   }
//   return request;
// }

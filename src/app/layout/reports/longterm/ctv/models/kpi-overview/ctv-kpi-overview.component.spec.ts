import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvKpiOverviewComponent } from './ctv-kpi-overview.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { mockedObservable } from '@app/models/testObservable';

describe('CtvKpiOverviewComponent', () => {
  let component: CtvKpiOverviewComponent;
  let fixture: ComponentFixture<CtvKpiOverviewComponent>;
  let transferSpy;
  let dprSpy;
  let engineSpy;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
      ],
      declarations: [ CtvKpiOverviewComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvKpiOverviewComponent);
    component = fixture.componentInstance;

    component.minDate = 738187;
    component.maxDate = 738189;
    component.mmsi = [987654321];
    component.vesselNames = ['Test CTV'];

    transferSpy = spyOn(MockedCommonService.prototype, 'getTransfersForVesselByRangeForCTV');
    dprSpy =  spyOn(MockedCommonService.prototype, 'getCtvInputsByRange');
    engineSpy = spyOn(MockedCommonService.prototype, 'getEngineStatsForRange');

    fixture.detectChanges();
  });

  it('should create with valid date', () => {
    component.kpis = [[{
      month: 'Test Date',
      site: 'TEST',
      totalFuelUsed: 'N/a',
      fuelUsedPerWorkingDay: 'N/a',
      totalPaxTransfered: 1,
      numCargoOps: 1,
      totalDistanceSailed: 'N/a',
      cargoDownKg: 1,
      cargoUpKg: 1,
    }]]
    expect(component).toBeTruthy();
  });

  it('should create with full dataset',() => {
    const engines = [{
      _id: 987654321,
      fuelUsedTotalM3: [0],
      label: ['Test_vessel'],
      date: [738188],
    }];

    const transfers = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      cargoUp: [1],
      cargoDown: [1],
      paxUp: [1],
      paxDown: [1],
      fieldname: ['Testersons_turbine_coordinates'],
    }];

    const dprs = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      inputStats: [{fuelConsumption: 0}],
      DPRstats: [{sailedDistance: 100}]
    }]


    transferSpy.and.returnValue(mockedObservable(transfers));
    dprSpy.and.returnValue(mockedObservable(dprs));
    engineSpy.and.returnValue(mockedObservable(engines));
    
    fixture.detectChanges();
    
    component.ngOnChanges();

    expect(component.kpis[0][0].cargoUpKg).toBe(1);
    expect(component.kpis[0][0].cargoDownKg).toBe(1);
    expect(component.kpis[0][0].numCargoOps).toBe(2);
    expect(component.kpis[0][0].totalPaxTransfered).toBe(2);
    expect(component.kpis[0][0].totalDistanceSailed).toBe('100 NM');
    expect(component.kpis[0][0].totalFuelUsed).toBe('0 l');
    expect(component.kpis[0][0].fuelUsedPerWorkingDay).toBe('0 l / NM');

    
    expect(component).toBeTruthy();
  });

  it('should create with missing range',() => {
    const engines = [{
      _id: 987654321,
      fuelUsedTotalM3: [0],
      label: ['Test_vessel'],
      date: [738188],
    }];

    const transfers = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      cargoUp: [1],
      cargoDown: [1],
      paxUp: [1],
      paxDown: [1],
      fieldname: ['Testersons_turbine_coordinates'],
    }];

    const dprs = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      inputStats: [{fuelConsumption: 0}],
      DPRstats: []
    }]


    transferSpy.and.returnValue(mockedObservable(transfers));
    dprSpy.and.returnValue(mockedObservable(dprs));
    engineSpy.and.returnValue(mockedObservable(engines));
    
    fixture.detectChanges();
    
    component.ngOnChanges();

    expect(component.kpis[0][0].cargoUpKg).toBe(1);
    expect(component.kpis[0][0].cargoDownKg).toBe(1);
    expect(component.kpis[0][0].numCargoOps).toBe(2);
    expect(component.kpis[0][0].totalPaxTransfered).toBe(2);
    expect(component.kpis[0][0].totalDistanceSailed).toBe('0 NM');
    expect(component.kpis[0][0].totalFuelUsed).toBe('0 l');
    expect(component.kpis[0][0].fuelUsedPerWorkingDay).toBe('N/a');

    expect(component).toBeTruthy();
  });

  it('should prefer manual inputted fuel over engine stats',() => {
    const engines = [{
      _id: 987654321,
      fuelUsedTotalM3: [0.452714],
      label: ['Test_vessel'],
      date: [738188],
    }];

    const transfers = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      cargoUp: [1],
      cargoDown: [1],
      paxUp: [1],
      paxDown: [1],
      fieldname: ['Testersons_turbine_coordinates'],
    }];

    const dprs = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      inputStats: [{fuelConsumption: 4321}],
      DPRstats: [{sailedDistance: 1}]
    }]


    transferSpy.and.returnValue(mockedObservable(transfers));
    dprSpy.and.returnValue(mockedObservable(dprs));
    engineSpy.and.returnValue(mockedObservable(engines));
    
    fixture.detectChanges();
    
    component.ngOnChanges();

    expect(component.kpis[0][0].cargoUpKg).toBe(1);
    expect(component.kpis[0][0].cargoDownKg).toBe(1);
    expect(component.kpis[0][0].numCargoOps).toBe(2);
    expect(component.kpis[0][0].totalPaxTransfered).toBe(2);
    expect(component.kpis[0][0].totalDistanceSailed).toBe('1 NM');
    expect(component.kpis[0][0].totalFuelUsed).toBe('4321 l');
    expect(component.kpis[0][0].fuelUsedPerWorkingDay).toBe('4321 l / NM');

    expect(component).toBeTruthy();
  });
  
  it('should not show infinite l/NM when range = 0',() => {
    const engines = [{
      _id: 987654321,
      fuelUsedTotalM3: [0.452714],
      label: ['Test_vessel'],
      date: [738188],
    }];

    const transfers = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      cargoUp: [1],
      cargoDown: [1],
      paxUp: [1],
      paxDown: [1],
      fieldname: ['Testersons_turbine_coordinates'],
    }];

    const dprs = [{
      _id: 987654321,
      label: ['Test_vessel'],
      date: [738188],
      inputStats: [{fuelConsumption: 4321}],
      DPRstats: [{sailedDistance: 0}]
    }]


    transferSpy.and.returnValue(mockedObservable(transfers));
    dprSpy.and.returnValue(mockedObservable(dprs));
    engineSpy.and.returnValue(mockedObservable(engines));
    
    fixture.detectChanges();
    
    component.ngOnChanges();

    expect(component.kpis[0][0].cargoUpKg).toBe(1);
    expect(component.kpis[0][0].cargoDownKg).toBe(1);
    expect(component.kpis[0][0].numCargoOps).toBe(2);
    expect(component.kpis[0][0].totalPaxTransfered).toBe(2);
    expect(component.kpis[0][0].totalDistanceSailed).toBe('0 NM');
    expect(component.kpis[0][0].totalFuelUsed).toBe('4321 l');
    expect(component.kpis[0][0].fuelUsedPerWorkingDay).toBe('N/a');

    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

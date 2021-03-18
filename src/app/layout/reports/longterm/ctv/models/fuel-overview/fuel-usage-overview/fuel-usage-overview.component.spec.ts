import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

import { FuelUsageOverviewComponent } from './fuel-usage-overview.component';

describe('FuelUsageOverviewComponent', () => {
  let component: FuelUsageOverviewComponent;
  let fixture: ComponentFixture<FuelUsageOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelUsageOverviewComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelUsageOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show graph', () => {
    component.retrievedData = {};
    expect(component.noData).toBe(true);
    expect(component).toBeTruthy();
  });

  it('should show graph with only engine data', () => {
    component.retrievedData = {
      engines: [{
        _id: 235084466,
        date: [738187],
        label: ['testvessel'],
        fuelUsedTotalM3: [1000]
      }],
      input: [{
        inputStats: [{}],
        date: [738187],
        label: ['testvessel'],
      }]
    };

    component.processDataForGraph(component.retrievedData);
    fixture.detectChanges();
    expect(component.noData).toBe(false);
    expect(component).toBeTruthy();
  });
  
  it('should show graph with only input data', () => {
    component.retrievedData = {
      input: [{
        _id: 235084466,
        date: [738187],
        label: ['testvessel'],
        inputStats: [{fuelConsumption: 1000}]
      }],
      engines: [{
        _id: 235084466,
        date: [738187],
        label: ['testvessel'],
        fuelUsedTotalM3: []
      }]
    };
    component.processDataForGraph(component.retrievedData);
    fixture.detectChanges();

    expect(component.noData).toBe(false);
    expect(component).toBeTruthy();
  });

  it('should create with working dataset', () => {
    component.retrievedData = {
      input: {
        date: [738188],
        inputStats: {},
        label: ['Testvessel']
      },
      engines: {
        date: [738188],
        fuelUsedTotalM3: [1],
        label: ['Testvessel']
      }
    }



    expect(component).toBeTruthy();
  });

  
});

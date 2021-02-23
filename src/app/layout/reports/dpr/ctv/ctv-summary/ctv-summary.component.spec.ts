import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CtvSummaryComponent } from './ctv-summary.component';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CTVGeneralStatsModel } from '../../models/generalstats.model';
import { mockedObservable } from '@app/models/testObservable';

describe('CtvSummaryComponent', () => {
  let component: CtvSummaryComponent;
  let fixture: ComponentFixture<CtvSummaryComponent>;
  const mocker = new MockedCommonService();
  let general: CTVGeneralStatsModel;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvSummaryComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
      imports: [
        NgbModule,
        FormsModule,
        CommonModule,
        NgMultiSelectDropDownModule,
      ]
    }).compileComponents();
  }));

  describe('should', () => {
    beforeAll((done) => {
      mocker.getGeneral({
        mmsi: 123456789,
        date: 737700,
        vesselName: 'Test CTV',
        vesselType: 'CTV',
      }).subscribe(_gen => {
        general = _gen.data[0];
        done();
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(CtvSummaryComponent);
      component = fixture.componentInstance;
      component.tokenInfo = UserTestService.getMockedAccessToken();
      component.general = general;
      component.generalInputStats = {
        date: general.date,
        customInput: 'CUSTOM INPUT',
        drillsConducted: [],
        fuelConsumption: 0,
        mmsi: general.mmsi,
        landedGarbage: 10,
        landedOil: 100,
        toolboxConducted: [],
        observations: [],
        incidents: [],
        passengers: [],
      };
      component.engine = {
        fuelUsedDepartM3: 1,
        fuelUsedReturnM3: 2,
        fuelUsedTotalM3: 3,
        fuelUsedTransferM3: 4,
        co2TotalKg: 5,
        fuelOther: 0,
        fuelPerHour: 1,
      };

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should save changes', () => {
      const spy = spyOn(MockedCommonService.prototype, 'saveCTVGeneralStats').and.returnValue(mockedObservable({
        data: 'Yay'
      }));
      component.saveGeneralStats();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('should without data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CtvSummaryComponent);
      component = fixture.componentInstance;
      component.tokenInfo = UserTestService.getMockedAccessToken();
    });

    it('render', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('should prefer the right fuel value', () => {
    beforeAll((done) => {
      mocker.getGeneral({
        mmsi: 123456789,
        date: 737700,
        vesselName: 'Test CTV',
        vesselType: 'CTV',
      }).subscribe(_gen => {
        general = _gen.data[0];
        done();
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(CtvSummaryComponent);
      component = fixture.componentInstance;
      component.tokenInfo = UserTestService.getMockedAccessToken();

      component.fuelConsumedValue = '0 m³';
      component.general = general;
      component.generalInputStats = {
        date: general.date,
        customInput: 'CUSTOM INPUT',
        drillsConducted: [],
        fuelConsumption: 0,
        mmsi: general.mmsi,
        landedGarbage: 10,
        landedOil: 100,
        toolboxConducted: [],
        observations: [],
        incidents: [],
        passengers: [],
      };
      component.engine = {
        fuelUsedDepartM3: 1,
        fuelUsedReturnM3: 2,
        fuelUsedTotalM3: 3,
        fuelUsedTransferM3: 4,
        co2TotalKg: 5,
        fuelOther: 0,
        fuelPerHour: 1,
      };
      fixture.detectChanges();
    });

    it('prefer engine fuel value since manual fuel input = 0', () => {
      fixture.detectChanges();
      component.generalInputStats.fuelConsumption = 0;
      component.engine.fuelUsedTotalM3 = 2;
      component.getValueForFuelConsumed();

      expect(component.fuelConsumedValue).toBe('2 m³');
      expect(component).toBeTruthy;
    });


    it('prefer manually inputted fuel value since manual fuel input > 0', () => {
      fixture.detectChanges();
      component.generalInputStats.fuelConsumption = 3;
      component.engine.fuelUsedTotalM3 = 0;
      component.getValueForFuelConsumed();

      expect(component.fuelConsumedValue).toBe('3 m³');
      expect(component).toBeTruthy;
    });

    it('prefer manually inputted fuel value when both engine and input has value and > 0 ', () => {
      fixture.detectChanges();
      component.generalInputStats.fuelConsumption = 3;
      component.engine.fuelUsedTotalM3 = 5;
      component.getValueForFuelConsumed();

      expect(component.fuelConsumedValue).toBe('3 m³');
      expect(component).toBeTruthy;
    });

    it('Value is 0 when both values are 0 ', () => {
      fixture.detectChanges();
      component.generalInputStats.fuelConsumption = 0;
      component.engine.fuelUsedTotalM3 = 0;
      component.getValueForFuelConsumed();

      expect(component.fuelConsumedValue).toBe('0 m³');
      expect(component).toBeTruthy;
    });

    it('Value is 0 m3 when both values are NaN/Null ', () => {
      fixture.detectChanges();
      component.generalInputStats.fuelConsumption = null;
      component.engine.fuelUsedTotalM3 = null;
      component.getValueForFuelConsumed();

      expect(component.fuelConsumedValue).toBe('0 m³');
      expect(component).toBeTruthy;
    });

  });

  describe('should only show H3 no data is available for sumamry', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(CtvSummaryComponent);
      component = fixture.componentInstance;
      component.tokenInfo = UserTestService.getMockedAccessToken();
    });

    it('does not crash when no engine and dprInput data is available', () => {
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#CtvSummaryWarning').textContent).toContain('There has been an error retrieving the CTV summary statistics');
    });

    it('does not crash when only dprInput data is available', () => {
      component.generalInputStats = {
        date: 737700,
        customInput: 'CUSTOM INPUT',
        drillsConducted: [],
        fuelConsumption: 0,
        mmsi: 12345678,
        landedGarbage: 10,
        landedOil: 100,
        toolboxConducted: [],
        observations: [],
        incidents: [],
        passengers: [],
      };
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#generalStatisticsHeader').textContent).toBeTruthy();
    });

    it('does not crash when only engine data is available', () => {
      component.engine = {
        fuelUsedDepartM3: 1,
        fuelUsedReturnM3: 2,
        fuelUsedTotalM3: 3,
        fuelUsedTransferM3: 4,
        co2TotalKg: 5,
        fuelOther: 0,
        fuelPerHour: 1,
      };
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#generalStatisticsHeader').textContent).toBeTruthy();
    });
  });
});

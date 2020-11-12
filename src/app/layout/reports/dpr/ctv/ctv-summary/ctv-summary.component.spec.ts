import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvSummaryComponent } from './ctv-summary.component';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { CTVGeneralStatsModel } from '../../models/generalstats.model';
import { mockedObservable } from '@app/models/testObservable';

describe('CtvSummaryComponent', () => {
  let component: CtvSummaryComponent;
  let fixture: ComponentFixture<CtvSummaryComponent>;
  const mocker = new MockedCommonService();
  let general: CTVGeneralStatsModel;


  beforeAll((done) => {
    mocker.getGeneral({
      mmsi: 123456789,
      date: 737700,
      vesselName: 'Test CTV',
      vesselType: 'CTV',
    }).subscribe(_gen => {
      general = _gen.data[0];
      done()
    });
  })

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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvSummaryComponent);
    component = fixture.componentInstance;
    component.tokenInfo = UserTestService.getMockedAccessToken();

    component.general = general;
    component.generalInputStats = {
      date: general.date,
      customInput: 'CUSTOM INPUT',
      drillsConducted: [],
      fuelConsumption: 1,
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

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should save changes', () => {
    let spy = spyOn(MockedCommonService.prototype, 'saveCTVGeneralStats').and.returnValue(mockedObservable({
      data: 'Yay'
    }));
    component.saveGeneralStats();
    expect(spy).toHaveBeenCalled();
  })
});

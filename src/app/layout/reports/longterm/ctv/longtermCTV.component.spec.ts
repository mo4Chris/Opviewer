import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from '@app/shared';
import { LongtermCTVComponent } from './longtermCTV.component';
import { LongtermVesselObjectModel } from '../longterm.component';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { DeploymentGraphComponent } from './models/deploymentgraph/deploymentGraph.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { VesselinfoComponent } from './models/vesselinfo/vesselinfo.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { LongtermBarGraphComponent } from '../models/longterm-bar-graph/longterm-bar-graph.component';
import { LongtermScatterGraphComponent } from '../models/longterm-scatter-graph/longterm-scatter-graph.component';
import { LongtermTrendGraphComponent } from '../models/longterm-trend-graph/longterm-trend-graph.component';
import { CtvUtilizationGraphComponent } from './models/longterm_utilization/utilizationGraph.component';
import { CtvLongtermUtilSubGraphComponent } from './models/longterm_utilization/longterm-util-sub-graph/longterm-util-sub-graph.component';
import { MockComponents } from 'ng-mocks';
import { EngineOverviewComponent } from './models/engine-overview/engine-overview.component';

describe('Longterm_CTV', () => {
  let component: LongtermCTVComponent;
  let fixture: ComponentFixture<LongtermCTVComponent>;

  const userBoats = [{
    mmsi: 235113651,
    nicename: 'Seacat Mischief',
    rawName: 'Seacat_Mischief',
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        PageHeaderModule,
        CommonModule,
        NgMultiSelectDropDownModule,
      ],
      declarations: [
        LongtermCTVComponent,
        DeploymentGraphComponent,
        VesselinfoComponent,
        LongtermBarGraphComponent,
        LongtermScatterGraphComponent,
        LongtermTrendGraphComponent,
        CtvUtilizationGraphComponent,
        CtvLongtermUtilSubGraphComponent,
        MockComponents(
          EngineOverviewComponent
        )
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermCTVComponent);
    component = fixture.componentInstance;
    component.vesselObject = <LongtermVesselObjectModel> {
      mmsi: [userBoats[0].mmsi],
      dateMin: 737791, // 1 jan 2020
      dateMax: 737851, // 1 mar 2020
      dateNormalMin: 'Test date 1',
      dateNormalMax: 'Test date 2',
      vesselName: [userBoats[0].rawName]
    };
    component.fromDate = new NgbDate(2020, 1, 1);
    component.toDate = new NgbDate(2020, 3, 1);
    const testToken: any = UserTestService.getMockedAccessToken({
      'userPermission': 'admin',
      'userBoats': userBoats
    });
    testToken.userBoats = testToken.userBoats[0].nicename;
    component.tokenInfo =  testToken;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should run ngOnChanges', () => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
  });
});

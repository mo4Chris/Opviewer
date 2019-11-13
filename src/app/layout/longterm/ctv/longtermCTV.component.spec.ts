import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '../../../shared';
import { CommonService } from '../../../common.service';
import { LongtermCTVComponent } from './longtermCTV.component';
import { LongtermComponent, LongtermVesselObjectModel } from '../longterm.component';
import { UserService } from '../../../shared/services/user.service';
import { UserTestService } from '../../../shared/services/test.user.service';
import { DeploymentGraphComponent } from './models/deploymentgraph/deploymentGraph.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component';
import { RouterTestingModule } from '@angular/router/testing';
import { VesselinfoComponent } from './models/vesselinfo/vesselinfo.component';
import { MockedCommonService } from '../../../supportModules/mocked.common.service';

describe('Longterm_CTV', () => {
  let component: LongtermCTVComponent;
  let fixture: ComponentFixture<LongtermCTVComponent>;

  const userBoats = [{
    mmsi: 235113651,
    nicename: 'Seacat Mischief'
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule.forRoot(),
        ReactiveFormsModule,
        PageHeaderModule,
        HttpModule,
        HttpClientModule,
        CommonModule,
        NgMultiSelectDropDownModule.forRoot(),
        RouterTestingModule
      ],
      declarations: [
        LongtermCTVComponent,
        DeploymentGraphComponent,
        VesselinfoComponent
      ],
      providers: [
        {provide: CommonService, useClass: MockedCommonService},
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermCTVComponent);
    component = fixture.componentInstance;
    component.vesselObject = <LongtermVesselObjectModel> {
      mmsi: [userBoats[0].mmsi],
      dateMin: 747700,
      dateMax: 747710,
      dateNormalMin: 'Test date 1',
      dateNormalMax: 'Test date 2',
    };
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
});

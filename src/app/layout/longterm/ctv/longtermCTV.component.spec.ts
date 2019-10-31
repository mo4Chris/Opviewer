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
import { LongtermComponent } from '../longterm.component';
import { UserService } from '../../../shared/services/user.service';
import { UserTestService } from '../../../shared/services/test.user.service';
import { DeploymentGraphComponent } from '../models/deploymentgraph/deploymentGraph.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component';

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
        RouterModule.forRoot([]),
        NgMultiSelectDropDownModule
      ],
      declarations: [
        LongtermCTVComponent,
        DeploymentGraphComponent,
      ],
      providers: [
        CommonService,
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermCTVComponent);
    component = fixture.componentInstance;
    component.vesselObject = {
      mmsi: [userBoats[0].mmsi],
      dateMin: 1,
      dateMax: 1,
      dateNormalMin: '',
      dateNormalMax: '',
    };
    component.tokenInfo = UserTestService.getMockedAccessToken({
      'userPermission': 'admin',
      'userBoats': userBoats
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

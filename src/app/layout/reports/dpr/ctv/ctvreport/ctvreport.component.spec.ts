import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvreportComponent } from './ctvreport.component';
import { UserTestService } from '@app/shared/services/test.user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PageHeaderModule, SharedPipesModule } from '@app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VesselObjectModel, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { CtvSummaryComponent } from '../ctv-summary/ctv-summary.component';
import { CtvTurbineTransferComponent } from '../ctv-turbine-transfer/ctv-turbine-transfer.component';
import { CtvslipgraphComponent } from '../models/ctvslipgraph/ctvslipgraph.component';
import { AlertService } from '@app/supportModules/alert.service';


describe('CtvReportComponent', () => {
  let component: CtvreportComponent;
  let fixture: ComponentFixture<CtvreportComponent>;

  const tokenInfo = {
    admin: UserTestService.getMockedAccessToken({
      userPermission: 'admin'
    }),
    vesselMaster: UserTestService.getMockedAccessToken({
      userPermission: 'Vessel master'
    }),
    marineControll: UserTestService.getMockedAccessToken({
      userPermission: 'Marine controller'
    }),
    logisticSpecialist: UserTestService.getMockedAccessToken({
      userPermission: 'Logistics specialist'
    }),
  };
  const vesselObject = (token): VesselObjectModel =>  {
    return {
      date: 737700,
      mmsi: token.userBoats[0].mmsi,
      dateNormal: new Date(2019, 10, 2),
      vesselType: 'CTV',
      vesselName: 'TEST CTV'
    };
  };
  const mapPixelWidth = 400;
  // const mapPromise: Promise<google.maps.Map> = new Promise(() => null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
      ],
      declarations: [
        CtvreportComponent,
        CtvSummaryComponent,
        CtvTurbineTransferComponent,
        CtvslipgraphComponent,
      ],
      providers: [
        MockedCommonServiceProvider
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => {


    fixture = TestBed.createComponent(CtvreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.mapPixelWidth = mapPixelWidth;
    // component.mapPromise = mapPromise;
  }));

  it('Should create as admin', async(() => {
    component.tokenInfo = tokenInfo.admin;
    component.vesselObject = vesselObject(component.tokenInfo);

    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    setTimeout(() => {
      expect(component).toBeTruthy();
      expect(component.noPermissionForData).toBe(false);
      expect(component.transferData).toBeDefined(); // Might fail under timeouts
      expect(component.transferData.length).toEqual(1);
    });
  }));

  it('should create as vessel master', async(() => {
    component.tokenInfo = tokenInfo.vesselMaster;
    component.vesselObject = vesselObject(component.tokenInfo);

    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    setTimeout(() => {
      expect(component).toBeTruthy();
      expect(component.noPermissionForData).toBe(false);
      expect(component.transferData).toBeDefined(); // Might fail under timeouts
      expect(component.transferData.length).toEqual(1);
    });
  }));

  it('should create as marine controller', async(() => {
    component.tokenInfo = tokenInfo.marineControll;
    component.vesselObject = vesselObject(component.tokenInfo);

    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    setTimeout(() => {
      expect(component).toBeTruthy();
      expect(component.noPermissionForData).toBe(false);
      expect(component.transferData).toBeDefined(); // Might fail under timeouts
      expect(component.transferData.length).toEqual(1);
    });
  }));

  it('should create as logistic specialist', async(() => {
    component.tokenInfo = tokenInfo.logisticSpecialist;
    component.vesselObject = vesselObject(component.tokenInfo);

    expect(component).toBeTruthy();

    component.buildPageWithCurrentInformation();
    setTimeout(() => {
      expect(component).toBeTruthy();
      expect(component.noPermissionForData).toBe(false);
      expect(component.transferData).toBeDefined(); // Might fail under timeouts
      expect(component.transferData.length).toEqual(1);
    });
  }));

  it('Should save comments', () => {
    const spy = spyOn(AlertService.prototype, 'sendAlert').and.callThrough();
    component.tokenInfo = tokenInfo.admin;
    component.saveComment({
      comment: 'Test',
      commentChanged: {
        otherComment: '',
      },
    });
    expect(spy).toHaveBeenCalled();
  });

  it('Should make requests', (done) => {
    component.tokenInfo = tokenInfo.admin;
    component.transferData = [];
    const transfer = {
      videoAvailable: true,
      video_requested: {
        text: 'Not Requested'
      },
    };
    component.videoBudget = {
      maxBudget: 100,
      currentBudget: 50,
    };
    expect(component).toBeTruthy();
    component.setRequest(transfer);
    done();
  });

  it('Should check the video budget', () => {
    component.videoBudget = {
      maxBudget: 100,
      currentBudget: 50,
    };
    expect(component.checkVideoBudget(10, {
      text: 'test_1',
      disabled: false,
      status: 'superb',
      active: true,
    })).toEqual({
      text: 'test_1',
      disabled: false,
      status: 'superb',
      active: true,
    });
    expect(component.checkVideoBudget(10, {
      text: 'test_2',
      disabled: false,
      status: 'superb',
      active: false,
    })).not.toEqual({
      text: 'test_2',
      disabled: false,
      status: 'superb',
      active: true,
    });
    expect(component.checkVideoBudget(80, {
      text: 'test_3',
      disabled: true,
      status: 'superb',
      active: false,
    })).not.toEqual({
      text: 'test_3',
      disabled: true,
      status: 'superb',
      active: false,
    });
    expect(component.checkVideoBudget(80, {
      text: 'test_4',
      disabled: true,
      status: 'denied',
      active: false,
    })).toEqual({
      text: 'test_4',
      disabled: true,
      status: 'denied',
      active: false,
    });
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvreportComponent } from './ctvreport.component';
import { UserTestService } from '../../../../shared/services/test.user.service';
import { mockedObservable } from '../../../../models/testObservable';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PageHeaderModule, SharedPipesModule } from '../../../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonService } from '../../../../common.service';
import { HttpModule } from '@angular/http';
import { MockedCommonService, VesselObjectModel, MockedCommonServiceProvider } from '../../../../supportModules/mocked.common.service';


describe('CtvReportComponent', () => {
  let component: CtvreportComponent;
  let fixture: ComponentFixture<CtvreportComponent>;
  const mockService = new MockedCommonService();

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
    };
  };
  const mapPixelWidth = 400;
  // const mapPromise: Promise<google.maps.Map> = new Promise(() => null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // AgmCoreModule.forRoot({
        //     apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        // }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        CommonModule,
        PageHeaderModule,
        SharedPipesModule,
        RouterTestingModule,
        HttpModule
      ],
      declarations: [ CtvreportComponent ],
      providers: [
        MockedCommonServiceProvider
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    spyOn(CommonService.prototype, 'getVideoRequests').and.returnValue(mockedObservable([]));
    spyOn(CtvreportComponent.prototype, 'createCharts');


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
});

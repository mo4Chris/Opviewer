import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {APP_BASE_HREF} from '@angular/common';
import { CtvreportComponent } from './ctvreport.component';
import { UserTestService } from '../../../../shared/services/test.user.service';
import { mockedObservable } from '../../../../models/testObservable';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { VesselreportRoutingModule } from '../../vesselreport-routing.module';
import { PageHeaderModule, SharedPipesModule } from '../../../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonService } from '../../../../common.service';

describe('CtvreportComponent', () => {
  let component: CtvreportComponent;
  let fixture: ComponentFixture<CtvreportComponent>;

  const tokenInfo = UserTestService.getMockedAccessToken({
    userPermission: 'admin'
  });
  const vesselObject = {
    date: 737700,
    mmsi: tokenInfo.userBoats[0].mmsi,
    dateNormal: new Date(2019, 10, 2),
    vesselType: 'CTV',
  };
  const mapPixelWidth = 400;
  // const mapPromise: Promise<google.maps.Map> = new Promise(() => null);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        // AgmCoreModule.forRoot({
        //     apiKey: 'AIzaSyDOfUHc9qh2V3X51XdoYS7vqEG8SZdpHRw'
        // }),
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        CommonModule,
        VesselreportRoutingModule,
        PageHeaderModule,
        SharedPipesModule,
        RouterTestingModule
      ],
      declarations: [ CtvreportComponent ],
      providers: [CommonService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.tokenInfo = tokenInfo;
    component.vesselObject = vesselObject;
    component.mapPixelWidth = mapPixelWidth;
    // component.mapPromise = mapPromise;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

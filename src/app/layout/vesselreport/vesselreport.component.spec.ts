import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselreportComponent } from './vesselreport.component';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '../../shared';
import { CommonService } from '../../common.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';

describe('VesselReportComponent', () => {
  let component: VesselreportComponent;
  let fixture: ComponentFixture<VesselreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AgmCoreModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        PageHeaderModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpModule],
      declarations: [ VesselreportComponent ],
      providers: [MockedCommonServiceProvider]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});

import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule, SharedPipesModule } from '../../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '../../../shared/services/test.user.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { SovreportComponent } from './sov/sovreport/sovreport.component';
import { CalculationService } from '../../../supportModules/calculation.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { GmapService } from '../../../supportModules/gmap.service';
import { ReportDprComponent } from './report-dpr.component';

describe('VesselReportComponent', () => {
  let component: ReportDprComponent;
  let fixture: ComponentFixture<ReportDprComponent>;

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
        NgMultiSelectDropDownModule,
        SharedPipesModule,
        HttpModule],
      declarations: [ ReportDprComponent, CtvreportComponent, SovreportComponent ],
      providers: [MockedCommonServiceProvider, MockedUserServiceProvider, CalculationService]
    })
    .compileComponents();

    spyOn(ReportDprComponent.prototype, 'getDateFromParameter').and.returnValue(NaN); // Equivalent to no date provided
    spyOn(ReportDprComponent.prototype, 'getMMSIFromParameter').and.returnValue(123456789); // CTV test vessel - replace mmsi later if not desired
    spyOn(GmapService.prototype, 'reset');
    spyOn(GmapService.prototype, 'addVesselRouteToGoogleMap');
    spyOn(GmapService.prototype, 'addTurbinesToMapForVessel');
    spyOn(CtvreportComponent.prototype, 'buildPageWithCurrentInformation');
    spyOn(SovreportComponent.prototype, 'buildPageWithCurrentInformation');

    fixture = TestBed.createComponent(ReportDprComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));
});

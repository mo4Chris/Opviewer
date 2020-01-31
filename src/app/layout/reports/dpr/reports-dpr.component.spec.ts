import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule, SharedPipesModule } from '../../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '../../../shared/services/test.user.service';
import { CtvreportComponent } from './ctv/ctvreport/ctvreport.component';
import { CalculationService } from '../../../supportModules/calculation.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReportsDprComponent } from './reports-dpr.component';
import { SovreportComponent } from './sov/sovreport.component';
import { ReportsModule } from '../reports.module';
import { SovreportModule } from './sov/sovreport.module';
import { CtvreportModule } from './ctv/ctvreport/ctvreport.module';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

fdescribe('ReportsDprComponent', () => {
  let component: ReportsDprComponent;
  let fixture: ComponentFixture<ReportsDprComponent>;
  const perm = <PermissionService> PermissionService.getDefaultPermission('admin');

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
        // SovreportModule,
        // CtvreportModule,
      ],
      declarations: [
        ReportsDprComponent,
        CtvreportComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
        {
          provide: PermissionService,
          useValue: perm
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(ReportsDprComponent.prototype, 'getDateFromParameter').and.returnValue(737700); // Equivalent to no date provided
    spyOn(ReportsDprComponent.prototype, 'getMMSIFromParameter').and.returnValue(123456789); // CTV test vessel - replace mmsi later if not desired
    spyOn(ReportsDprComponent.prototype, 'buildPageWithCurrentInformation');

    fixture = TestBed.createComponent(ReportsDprComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('Report dpr component should instantiate', (done) => {
    expect(component).toBeTruthy();
    done();
  });
});

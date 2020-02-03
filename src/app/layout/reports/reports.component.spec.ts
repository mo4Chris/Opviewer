import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgmCoreModule } from '@agm/core';
import { SharedPipesModule } from '@app/shared';
import { ReportsRoutingModule } from './reports-routing-module';
import { ReportsDprModule } from './dpr/reports-dpr.module';
import { LongtermModule } from './longterm/longterm.module';
import { SovSiemensMonthlyKpiModule } from './sov-siemens-monthly-kpi/sov-siemens-monthly-kpi.module';
import { TablesModule } from './tables/tables.module';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { UserTestService } from '@app/shared/services/test.user.service';
import { RouterService } from '@app/supportModules/router.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        NgbDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        NgMultiSelectDropDownModule,
        AgmCoreModule,
        SharedPipesModule,
        RouterTestingModule,

        ReportsRoutingModule,
        ReportsDprModule,
        LongtermModule,
        SovSiemensMonthlyKpiModule,
        TablesModule,
      ],
      declarations: [
        ReportsComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        UserTestService,
        RouterService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    component.activeRoute = <any> 'TEST';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

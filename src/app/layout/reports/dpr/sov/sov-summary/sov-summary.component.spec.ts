import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovSummaryComponent } from './sov-summary.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SovModel } from '../models/SovModel';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { HttpModule } from '@angular/http';
import { SummaryModel } from '../models/Summary';

describe('SovSummaryComponent', () => {
  let component: SovSummaryComponent;
  let fixture: ComponentFixture<SovSummaryComponent>;
  const newService = new MockedCommonService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        HttpModule
      ],
      declarations: [ SovSummaryComponent ],
      providers: [
        DatetimeService,
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SovSummaryComponent);
    component = fixture.componentInstance;
    component.backgroundColors = [];
    component.fieldName = '';
    component.sovModel = new SovModel();
    newService.getSov({
      mmsi: 987654321,
      date: 737700,
      vesselType: 'OSV',
      vesselName: 'TEST SOV'
    }).subscribe(sov => {
      component.sovModel.sovInfo = sov[0];
    });
    component.summary = new SummaryModel();
    fixture.detectChanges();
  }));

  it('should create', (done) => {
    expect(component).toBeTruthy();
    done();
  });

  it('Should create a summary', (done) => {
    component.CalculateDailySummary();
    expect(component).toBeTruthy();
    done();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SovSummaryComponent } from './sov-summary.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SovModel } from '../models/SovModel';
import { MockedCommonServiceProvider, MockedCommonService } from '@app/supportModules/mocked.common.service';
import { SummaryModel } from '../models/Summary';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { testBrokenHelpButtons, testEmptyTooltips } from '@app/layout/forecast/forecast-new-vessel/forecast-new-vessel.component.spec';

describe('SovSummaryComponent', () => {
  let component: SovSummaryComponent;
  let fixture: ComponentFixture<SovSummaryComponent>;
  const newService = new MockedCommonService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
      ],
      declarations: [ SovSummaryComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    }).compileComponents();
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should create a summary', () => {
    component.CalculateDailySummary();
    expect(component).toBeTruthy();
  });

  it('should not have any broken help buttons', testBrokenHelpButtons(() => fixture));

  it('should not have any broken tooltips', testEmptyTooltips(() => fixture));
});

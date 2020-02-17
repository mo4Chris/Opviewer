import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiemensKpiOverviewComponent } from './siemens-kpi-overview.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

describe('SiemensKpiOverviewComponent', () => {
  let component: SiemensKpiOverviewComponent;
  let fixture: ComponentFixture<SiemensKpiOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
      ],
      declarations: [ SiemensKpiOverviewComponent ],
      providers: [
        MockedCommonServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiemensKpiOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

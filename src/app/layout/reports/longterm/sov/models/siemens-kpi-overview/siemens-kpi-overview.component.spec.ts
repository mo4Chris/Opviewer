import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SiemensKpiOverviewComponent } from './siemens-kpi-overview.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { assertTableEqualRowLength } from '@app/layout/layout.component.spec';

describe('SiemensKpiOverviewComponent', () => {
  let component: SiemensKpiOverviewComponent;
  let fixture: ComponentFixture<SiemensKpiOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
      ],
      declarations: [ SiemensKpiOverviewComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiemensKpiOverviewComponent);
    component = fixture.componentInstance;

    component.mmsi = [987654321];
    component.vesselNames = ['Test SOV'];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have equal row length', () => {
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })
});

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TablesComponent } from './tables.component';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReportsModule } from '../reports.module';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { RouterService } from '@app/supportModules/router.service';
import { mockedObservable } from '@app/models/testObservable';
import { assertTableEqualRowLength } from '@app/layout/layout.component.spec';

describe('TablesComponent', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;
  let routingSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PageHeaderModule,
        ReportsModule,
        RouterTestingModule,
        BrowserAnimationsModule],
      declarations: [ TablesComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    routingSpy = spyOn(RouterService.prototype, 'route')
    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(routingSpy).not.toHaveBeenCalled();
  });

  it('should render without vessels', () => {
    spyOn(component['newService'], 'getVessel').and.returnValue(mockedObservable(null))
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have equal row length as admin', () => {
    component.permission.admin = true;
    component.permission.longterm = true;
    fixture.detectChanges()
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })

  it('should have equal row length as user w/ longterm', () => {
    component.permission.admin = false;
    component.permission.longterm = true;
    fixture.detectChanges()
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })

  it('should have equal row length as user w/out longterm', () => {
    component.permission.admin = false;
    component.permission.longterm = false;
    fixture.detectChanges()
    const table = document.querySelector('table');
    assertTableEqualRowLength(table as HTMLElement)
  })
});

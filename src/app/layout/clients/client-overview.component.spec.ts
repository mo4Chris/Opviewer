import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientOverviewComponent } from './client-overview.component';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockedUserServiceProvider, UserTestService } from '../../shared/services/test.user.service';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';

describe('ClientOverviewComponent', () => {
  let component: ClientOverviewComponent;
  let fixture: ComponentFixture<ClientOverviewComponent>;
  const user = UserTestService.getMockedAccessToken();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PageHeaderModule,
        NgbModule,
        NgMultiSelectDropDownModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
        declarations: [ClientOverviewComponent ],
        providers: [
          MockedCommonServiceProvider,
          MockedUserServiceProvider,
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

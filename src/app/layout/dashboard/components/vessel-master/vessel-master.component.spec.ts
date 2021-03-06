import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { VesselMasterComponent } from './vessel-master.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';

describe('VesselMasterComponent', () => {
  let component: VesselMasterComponent;
  let fixture: ComponentFixture<VesselMasterComponent>;
  const token = UserTestService.getMockedAccessToken({});

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselMasterComponent ],
      imports: [
        RouterTestingModule,
        NgbModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VesselMasterComponent);
    component = fixture.componentInstance;
    component.tokenInfo = token;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

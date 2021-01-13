import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
      ],
      declarations: [ AdminComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

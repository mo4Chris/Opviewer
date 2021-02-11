import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettingsComponent } from './user-settings.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule, SharedPipesModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpClientModule } from '@angular/common/http';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        PageHeaderModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        NgMultiSelectDropDownModule,
        SharedPipesModule,
        HttpClientModule
      ],
      declarations: [ UserSettingsComponent ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('Should create', () => {
    expect(component).toBeTruthy();
  });
});

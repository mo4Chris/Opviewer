import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSettingsComponent } from './user-settings.component';
import { MockedCommonServiceProvider } from '../../supportModules/mocked.common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule, SharedPipesModule } from '../../shared';
import { RouterTestingModule } from '@angular/router/testing';
import { UserTestService, MockedUserServiceProvider } from '../../shared/services/test.user.service';
import { SettingsService } from '../../supportModules/settings.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HttpModule } from '@angular/http';

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
        HttpModule],
      declarations: [ UserSettingsComponent ],
      providers: [ MockedCommonServiceProvider, MockedUserServiceProvider],
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

class MockedSettingsService extends SettingsService {
  constructor () {
    super(null);
  }
}

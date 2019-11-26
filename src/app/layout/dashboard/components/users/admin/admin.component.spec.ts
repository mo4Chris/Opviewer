import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';
import { DashboardComponent } from '../../../dashboard.component';
import { CommonService } from '../../../../../common.service';
import { HttpModule } from '@angular/http';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedCommonService, MockedCommonServiceProvider } from '../../../../../supportModules/mocked.common.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AgmCoreModule.forRoot(),
        HttpModule,
        RouterTestingModule,
        NgbModule,
      ],
      declarations: [ AdminComponent ],
      providers: [MockedCommonServiceProvider]
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

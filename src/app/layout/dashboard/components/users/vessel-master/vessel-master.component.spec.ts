import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselMasterComponent } from './vessel-master.component';
import { AgmCoreModule } from '@agm/core';
import { CommonService } from '../../../../../common.service';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockedCommonServiceProvider } from '../../../../../supportModules/mocked.common.service';
import { UserTestService } from '../../../../../shared/services/test.user.service';

describe('VesselMasterComponent', () => {
  let component: VesselMasterComponent;
  let fixture: ComponentFixture<VesselMasterComponent>;
  const token = UserTestService.getMockedAccessToken({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselMasterComponent ],
      imports: [
        AgmCoreModule.forRoot(),
        HttpModule,
        RouterTestingModule,
        NgbModule,
      ],
      providers: [MockedCommonServiceProvider]
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

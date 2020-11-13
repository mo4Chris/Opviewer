import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FleetLogComponent } from './fleet-log.component';
import { HttpModule } from '@angular/http';
import { PageHeaderModule } from '../../../shared';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FleetLogRoutingModule } from './fleet-log-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../../shared/services/user.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserTestService } from '../../../shared/services/test.user.service';
import { MockedCommonServiceProvider } from '../../../supportModules/mocked.common.service';

describe('FleetLogComponent', () => {
  let component: FleetLogComponent;
  let fixture: ComponentFixture<FleetLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpModule,
        HttpClientModule,
        FormsModule,
        PageHeaderModule,
        RouterTestingModule,
        FleetLogRoutingModule,
        BrowserAnimationsModule,
      ],
      providers: [MockedCommonServiceProvider],
      declarations: [FleetLogComponent]
    }).compileComponents();

    spyOn(UserService.prototype, 'getDecodedAccessToken').and.returnValue(UserTestService.getMockedAccessToken());
    spyOn(FleetLogComponent.prototype, 'getCampaignName').and.returnValue('Summer');
    spyOn(FleetLogComponent.prototype, 'getStartDate').and.returnValue(737485);
    spyOn(FleetLogComponent.prototype, 'getWindfield').and.returnValue('Beatrice');
    spyOn(FleetLogComponent.prototype, 'getUsers').and.returnValue([]);
    spyOn(FleetLogComponent.prototype, 'getSailDayChanged');
    fixture = TestBed.createComponent(FleetLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it('should create', (done) => {
    expect(component).toBeTruthy();
    done();
  });
});

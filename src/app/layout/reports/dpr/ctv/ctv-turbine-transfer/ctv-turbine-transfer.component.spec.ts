import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvTurbineTransferComponent } from './ctv-turbine-transfer.component';
import { UserTestService, MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';



describe('CtvTurbineTransferComponent', () => {
  let component: CtvTurbineTransferComponent;
  let fixture: ComponentFixture<CtvTurbineTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvTurbineTransferComponent ],
      imports: [
        NgbModule,
        FormsModule,
        CommonModule,
        NgMultiSelectDropDownModule,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvTurbineTransferComponent);
    component = fixture.componentInstance;
    component.tokenInfo = UserTestService.getMockedAccessToken();
    component.transfers = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

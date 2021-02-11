import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputComponent } from './sov-dpr-input.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SovDprInputReadonlyComponent } from './sov-dpr-input-readonly/sov-dpr-input-readonly.component';
import { SovHseDprInputVesselmasterComponent } from '../sov-hse-dpr-input/sov-hse-dpr-input-vesselmaster/sov-hse-dpr-input-vesselmaster.component';
import { CommonModule } from '@angular/common';
import { SovDprInputVesselmasterComponent } from './sov-dpr-input-vesselmaster/sov-dpr-input-vesselmaster.component';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { HttpClientModule } from '@angular/common/http';

describe('SovDprInputComponent', () => {
  let component: SovDprInputComponent;
  let fixture: ComponentFixture<SovDprInputComponent>;
  let saveSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        AutosizeModule,
        SupportModelModule,
        HttpClientModule,
      ],
      declarations: [
        SovDprInputComponent,
        SovDprInputReadonlyComponent,
        SovDprInputVesselmasterComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    spyOn(SovDprInputReadonlyComponent.prototype, 'ngOnChanges');
    spyOn(SovDprInputVesselmasterComponent.prototype, 'ngOnChanges');
    saveSpy = spyOn(SovDprInputVesselmasterComponent.prototype, 'saveStats');

    fixture = TestBed.createComponent(SovDprInputComponent);
    component = fixture.componentInstance;
    component.dprInput = {remarks: ''};
    fixture.detectChanges();
  });

  it('should create', (done) => {
    expect(component).toBeTruthy();
    done();
  });

  it('Should update HOC', (done) => {
    component.updateHOCTotal();
    expect(component).toBeTruthy();
    component.hoc = {
      Array: [{amount: 2, value: 'test'}],
      Total: 1,
      TotalOld: 3,
      TotalNew: 0
    };
    component.updateHOCTotal();
    expect(component).toBeTruthy();
    expect(component.hoc.Total).toEqual(2);
    expect(component.hoc.TotalNew).toEqual(5);
    done();
  });

  it('Should update Toolbox', (done) => {
    component.updateToolboxTotal();
    expect(component).toBeTruthy();
    component.toolbox = {
      Array: [{amount: 2, value: 'test'}],
      Total: 1,
      TotalOld: 3,
      TotalNew: 0
    };
    component.updateToolboxTotal();
    expect(component).toBeTruthy();
    expect(component.toolbox.Total).toEqual(2);
    expect(component.toolbox.TotalNew).toEqual(5);
    done();
  });

  it('Should correctly add standby times', (done) => {
    component.getTotalTimeStandby([{total: '02:10'}, {total: '01:30'}]);
    expect(component.totalStandbyTime).toEqual('03:40');
    done();
  });
});

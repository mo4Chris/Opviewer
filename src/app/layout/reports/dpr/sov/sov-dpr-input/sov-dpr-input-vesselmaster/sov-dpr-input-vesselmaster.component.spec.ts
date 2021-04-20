import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputVesselmasterComponent } from './sov-dpr-input-vesselmaster.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';


describe('SovDprInputVesselmasterComponent', () => {
  let component: SovDprInputVesselmasterComponent;
  let fixture: ComponentFixture<SovDprInputVesselmasterComponent>;

  let saveSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        AutosizeModule,
        SupportModelModule,
      ],
      declarations: [
        SovDprInputVesselmasterComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        DatetimeService,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    saveSpy = spyOn(SovDprInputVesselmasterComponent.prototype, 'saveStats');
    spyOn(SovDprInputVesselmasterComponent.prototype, 'ngOnChanges');

    fixture = TestBed.createComponent(SovDprInputVesselmasterComponent);
    component = fixture.componentInstance;
    // Need to set inputs before detecting changes
    setInputs(component);
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should update HOC', () => {
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
  });

  it('Should update Toolbox', () => {
    setInputs(component);
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
  });

  it('Should correctly subscribe to the save hook', () => {
    expect(saveSpy).toHaveBeenCalledTimes(0);
    component.saveFuelStats();
    expect(saveSpy).toHaveBeenCalledTimes(1);
    component.saveIncidentStats();
    expect(saveSpy).toHaveBeenCalledTimes(2);
    component.saveWeatherDowntimeStats();
    expect(saveSpy).toHaveBeenCalledTimes(6);
    component.saveCateringStats();
    expect(saveSpy).toHaveBeenCalledTimes(7);
    component.saveDPStats();
    expect(saveSpy).toHaveBeenCalledTimes(8);
  });

});

function setInputs(component: SovDprInputVesselmasterComponent) {
  const getVal = () => {
    return {
      Array: [],
      Total: 0,
      TotalOld: 0,
      TotalNew: 0,
    };
  };
  component.hoc = getVal();
  component.toolbox = getVal();
  component.vesselNonAvailability = getVal();
  component.weatherDowntime = getVal();
  component.standby = getVal();
  component.dp = getVal();
  component.liquids = {
    fuel: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    luboil: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    domwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 },
    potwater: { oldValue: 0, loaded: 0, consumed: 0, discharged: 0, newValue: 0 }
  };
  component.catering = {};
  component.remarks = '';
  component.accessDayType = {status: 'TEST'};
}

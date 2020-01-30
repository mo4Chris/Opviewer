import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputReadonlyComponent } from './sov-dpr-input-readonly.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';

describe('SovDprInputReadonlyComponent', () => {
  let component: SovDprInputReadonlyComponent;
  let fixture: ComponentFixture<SovDprInputReadonlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        AutosizeModule,
      ],
      declarations: [
        SovDprInputReadonlyComponent
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDprInputReadonlyComponent);
    component = fixture.componentInstance;
    // Need to set inputs before detecting changes
    setInputs(component);
    fixture.detectChanges();

  });

  it('should create', (done) => {
    console.log(component);
    expect(component).toBeTruthy();
    done();
  });

  it('Should set people on board', (done) => {
    component.ngOnChanges();
    expect(component).toBeTruthy();
    expect(component.peopleOnVessel.Total).toEqual(0);
    done();
  });

});

function setInputs(component: SovDprInputReadonlyComponent) {
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
  component.peopleOnVessel = {
    marine: 0,
    marineContractors: 0,
    project: 0,
    Total: 0
  };
  component.catering = {
    project: 0,
    marine: 0,
    marineContractors: 0,
    packedLunches: 0,
    extraMeals: 0,
    Array: [],
  };
  component.remarks = '';
}

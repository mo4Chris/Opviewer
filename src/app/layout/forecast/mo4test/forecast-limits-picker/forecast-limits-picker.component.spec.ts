import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ForecastLimitsPickerComponent } from './forecast-limits-picker.component';

xdescribe('ForecastLimitsPickerComponent', () => {
  let component: ForecastLimitsPickerComponent;
  let fixture: ComponentFixture<ForecastLimitsPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastLimitsPickerComponent ],
      imports:[
        CommonModule,
        NgbModule,
        FormsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastLimitsPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit on change', async(() => {
    let emitter = spyOn(component.limitsChange, 'emit');
    component.limits = [{
      dof: 'Heave',
      type: 'Acc',
      value: 1.5,
    }];
    fixture.detectChanges();
    component.ngOnChanges();
    expect(component.limitsCopy).toBeTruthy();

    let select = fixture.nativeElement.querySelector('.btn-primary');
    select.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(emitter).toHaveBeenCalled();
  }))

  it('should render relevant data', () => {
    component.limitsCopy = [{
      dof: 'Heave',
      type: 'Acc',
      value: 1.5,
    }, {
      dof: 'Pitch',
      type: 'Disp',
      value: 1.9,
    }];
    fixture.detectChanges()
    let opt = fixture.nativeElement.querySelector('option');
    expect(opt).toBeTruthy();
    expect(opt.value).toBeTruthy(); // We get [object object] here, not sure how to access the actual element
  })
});

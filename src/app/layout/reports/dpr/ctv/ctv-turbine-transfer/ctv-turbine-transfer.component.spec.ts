import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvTurbineTransferComponent } from './ctv-turbine-transfer.component';

describe('CtvTurbineTransferComponent', () => {
  let component: CtvTurbineTransferComponent;
  let fixture: ComponentFixture<CtvTurbineTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvTurbineTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvTurbineTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovTurbineTransfersComponent } from './sov-turbine-transfers.component';

describe('SovTurbineTransfersComponent', () => {
  let component: SovTurbineTransfersComponent;
  let fixture: ComponentFixture<SovTurbineTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovTurbineTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovTurbineTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

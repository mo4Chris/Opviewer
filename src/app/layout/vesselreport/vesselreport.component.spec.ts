import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselreportComponent } from './vesselreport.component';

describe('VesselreportComponent', () => {
  let component: VesselreportComponent;
  let fixture: ComponentFixture<VesselreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselLocationIndicatorComponent } from './vessel-location-indicator.component';

describe('VesselLocationIndicatorComponent', () => {
  let component: VesselLocationIndicatorComponent;
  let fixture: ComponentFixture<VesselLocationIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselLocationIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselLocationIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

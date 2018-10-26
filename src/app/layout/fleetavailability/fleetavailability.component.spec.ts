import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetavailabilityComponent } from './fleetavailability.component';

describe('UsersComponent', () => {
  let component: FleetavailabilityComponent;
  let fixture: ComponentFixture<FleetavailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FleetavailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetavailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

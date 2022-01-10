import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsmDashboardMapComponent } from './osm-dashboard-map.component';

describe('OsmDashboardMapComponent', () => {
  let component: OsmDashboardMapComponent;
  let fixture: ComponentFixture<OsmDashboardMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OsmDashboardMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsmDashboardMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselinfoComponent } from './vesselinfo.component';

describe('VesselinfoComponent', () => {
  let component: VesselinfoComponent;
  let fixture: ComponentFixture<VesselinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

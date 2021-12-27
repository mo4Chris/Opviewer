import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalLogoComponent } from './portal-logo.component';

describe('PortalLogoComponent', () => {
  let component: PortalLogoComponent;
  let fixture: ComponentFixture<PortalLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalLogoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

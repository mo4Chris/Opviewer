import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalSidebarComponent } from './portal-sidebar.component';

describe('PortalSidebarComponent', () => {
  let component: PortalSidebarComponent;
  let fixture: ComponentFixture<PortalSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

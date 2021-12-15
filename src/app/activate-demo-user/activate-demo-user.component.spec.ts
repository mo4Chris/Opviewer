import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateDemoUserComponent } from './activate-demo-user.component';

describe('ActivateDemoUserComponent', () => {
  let component: ActivateDemoUserComponent;
  let fixture: ComponentFixture<ActivateDemoUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivateDemoUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateDemoUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

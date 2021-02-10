import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mo4LightComponent } from './mo4-light.component';

describe('Mo4LightComponent', () => {
  let component: Mo4LightComponent;
  let fixture: ComponentFixture<Mo4LightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Mo4LightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Mo4LightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

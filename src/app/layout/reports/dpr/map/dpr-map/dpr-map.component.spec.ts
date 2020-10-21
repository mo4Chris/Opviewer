import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DprMapComponent } from './dpr-map.component';

describe('DprMapComponent', () => {
  let component: DprMapComponent;
  let fixture: ComponentFixture<DprMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DprMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DprMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

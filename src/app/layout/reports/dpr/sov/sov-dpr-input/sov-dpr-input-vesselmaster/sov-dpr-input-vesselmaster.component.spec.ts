import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDprInputVesselmasterComponent } from './sov-dpr-input-vesselmaster.component';

describe('SovDprInputVesselmasterComponent', () => {
  let component: SovDprInputVesselmasterComponent;
  let fixture: ComponentFixture<SovDprInputVesselmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovDprInputVesselmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDprInputVesselmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

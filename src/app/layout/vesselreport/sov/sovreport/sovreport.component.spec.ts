import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovreportComponent } from './sovreport.component';

describe('SovreportComponent', () => {
  let component: SovreportComponent;
  let fixture: ComponentFixture<SovreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

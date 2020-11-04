import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermPrintHeaderComponent } from './longterm-print-header.component';

describe('LongtermPrintHeaderComponent', () => {
  let component: LongtermPrintHeaderComponent;
  let fixture: ComponentFixture<LongtermPrintHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermPrintHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermPrintHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

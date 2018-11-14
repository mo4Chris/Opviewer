import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvreportComponent } from './ctvreport.component';

describe('CtvreportComponent', () => {
  let component: CtvreportComponent;
  let fixture: ComponentFixture<CtvreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

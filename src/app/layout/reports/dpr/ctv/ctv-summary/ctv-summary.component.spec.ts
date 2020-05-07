import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvSummaryComponent } from './ctv-summary.component';

describe('CtvSummaryComponent', () => {
  let component: CtvSummaryComponent;
  let fixture: ComponentFixture<CtvSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

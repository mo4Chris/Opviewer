import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovSummaryComponent } from './sov-summary.component';

describe('SovSummaryComponent', () => {
  let component: SovSummaryComponent;
  let fixture: ComponentFixture<SovSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

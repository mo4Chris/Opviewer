import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermTrendGraphComponent } from './longterm-trend-graph.component';

describe('LongtermTrendGraphComponent', () => {
  let component: LongtermTrendGraphComponent;
  let fixture: ComponentFixture<LongtermTrendGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermTrendGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermTrendGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermScatterGraphComponent } from './longterm-scatter-graph.component';

describe('LongtermScatterGraphComponent', () => {
  let component: LongtermScatterGraphComponent;
  let fixture: ComponentFixture<LongtermScatterGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermScatterGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermScatterGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermBarGraphComponent } from './longterm-bar-graph.component';

describe('LongtermBarGraphComponent', () => {
  let component: LongtermBarGraphComponent;
  let fixture: ComponentFixture<LongtermBarGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermBarGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermBarGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

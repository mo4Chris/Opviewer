import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermUtilSubGraphComponent } from './longterm-util-sub-graph.component';

describe('LongtermUtilSubGraphComponent', () => {
  let component: LongtermUtilSubGraphComponent;
  let fixture: ComponentFixture<LongtermUtilSubGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermUtilSubGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermUtilSubGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

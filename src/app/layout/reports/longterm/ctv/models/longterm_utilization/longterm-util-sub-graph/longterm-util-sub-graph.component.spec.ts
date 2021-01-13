import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvLongtermUtilSubGraphComponent } from './longterm-util-sub-graph.component';

fdescribe('CtvLongtermUtilSubGraphComponent', () => {
  let component: CtvLongtermUtilSubGraphComponent;
  let fixture: ComponentFixture<CtvLongtermUtilSubGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvLongtermUtilSubGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvLongtermUtilSubGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

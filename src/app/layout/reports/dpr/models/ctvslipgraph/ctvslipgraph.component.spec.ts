import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvslipgraphComponent } from './ctvslipgraph.component';

describe('CtvslipgraphComponent', () => {
  let component: CtvslipgraphComponent;
  let fixture: ComponentFixture<CtvslipgraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvslipgraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvslipgraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

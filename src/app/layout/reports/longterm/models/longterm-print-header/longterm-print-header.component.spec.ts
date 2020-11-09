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
    component.vesselObject = {
      mmsi: [],
      vesselName: [],
      dateMin: 738080,
      dateMax: 738081,
      dateNormalMin: '2020-10-16',
      dateNormalMax: '2020-10-17',
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermPrintHeaderbarComponent } from './longterm-print-headerbar.component';

describe('LongtermPrintHeaderComponent', () => {
  let component: LongtermPrintHeaderbarComponent;
  let fixture: ComponentFixture<LongtermPrintHeaderbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LongtermPrintHeaderbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermPrintHeaderbarComponent);
    component = fixture.componentInstance;
    component.vesselObject = {
      mmsi: [],
      vesselName: [],
      dateMin: 738080,
      dateMax: 738081,
      dateNormalMin: '2020-10-16',
      dateNormalMax: '2020-10-17',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

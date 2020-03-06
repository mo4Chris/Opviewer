import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovDcTransfersComponent } from './sov-dc-transfers.component';

describe('SovDcTransfersComponent', () => {
  let component: SovDcTransfersComponent;
  let fixture: ComponentFixture<SovDcTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovDcTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovDcTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

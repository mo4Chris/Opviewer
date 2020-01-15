import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovV2vTransfersComponent } from './sov-v2v-transfers.component';

describe('SovV2vTransfersComponent', () => {
  let component: SovV2vTransfersComponent;
  let fixture: ComponentFixture<SovV2vTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovV2vTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovV2vTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovPlatformTransfersComponent } from './sov-platform-transfers.component';

describe('SovPlatformTransfersComponent', () => {
  let component: SovPlatformTransfersComponent;
  let fixture: ComponentFixture<SovPlatformTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovPlatformTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovPlatformTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

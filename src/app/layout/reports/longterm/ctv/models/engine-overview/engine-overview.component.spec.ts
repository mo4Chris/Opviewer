import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineOverviewComponent } from './engine-overview.component';

describe('EngineOverviewComponent', () => {
  let component: EngineOverviewComponent;
  let fixture: ComponentFixture<EngineOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngineOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

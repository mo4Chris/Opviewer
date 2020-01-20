import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveSpectrumComponentComponent } from './wave-spectrum-component.component';

describe('WaveSpectrumComponentComponent', () => {
  let component: WaveSpectrumComponentComponent;
  let fixture: ComponentFixture<WaveSpectrumComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaveSpectrumComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveSpectrumComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

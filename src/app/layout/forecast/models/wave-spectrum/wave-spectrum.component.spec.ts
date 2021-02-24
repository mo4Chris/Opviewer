import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SovWaveSpectrumComponent } from './wave-spectrum.component';

describe('WaveSpectrumComponent', () => {
  let component: SovWaveSpectrumComponent;
  let fixture: ComponentFixture<SovWaveSpectrumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SovWaveSpectrumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SovWaveSpectrumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

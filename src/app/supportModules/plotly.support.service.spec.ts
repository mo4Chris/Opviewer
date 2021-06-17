import { TestBed } from '@angular/core/testing';
import { PlotlySupportService } from './plotly.support.service';

describe('PlotlyService', () => {
  let service: PlotlySupportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlotlySupportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set x limits', () => {
    const layout: Partial<Plotly.Layout> = {
      yaxis: {
        title: 'ABBA'
      }
    }
    const x = [0, 1, 2, 3, 4];
    service.setXLimits(x, layout);
    expect(layout.xaxis).toBeTruthy();
    expect(layout.xaxis.range).toEqual([0, 4]);
  })

  it('should correctly compute area lines', () => {
    const x = [0, 1, 2, 3, 4];
    const y = [2, 3, 4, 5, 6];
    const validator = (x, y) => (y>2) && (y<4);
    const areas = service.createAreaLines(x, y, validator);
    expect(areas.green).toEqual([
      {x: 0.5, y: 0},   // Lower point left side
      {x: 0.5, y: 2.5}, // Upper point left side
      {x: 1, y: 3},     // Upper point in the middle
      {x: 1.5, y: 3.5}, // Upper point right side
      {x: 1.5, y: 0}    // Lower point right side
    ])
    expect(areas.red).toBeTruthy()
  })
});

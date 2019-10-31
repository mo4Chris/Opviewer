import { ScatterplotComponent } from './scatterplot.component';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonService } from '../../../../common.service';
import { async } from 'q';

describe('Scatterplot', () => {
  let component: ScatterplotComponent;
  // let fixture: ComponentFixture<ScatterplotComponent>;
  const calcService = new CalculationService();
  const dateService = new DatetimeService();
  const vesselObject = {mmsi: [123456789], dateMin: 1, dateMax: 10, dateNormalMin: 'Test_min', dateNormalMax: 'Test_max'};
  const compArray = [
    { x: 'startTime', y: 'score', graph: 'scatter', xLabel: 'Time', yLabel: 'Transfer scores', dataType: 'transfer' }
  ];


  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [NgbModule.forRoot(),
            AgmCoreModule.forRoot(),
            HttpModule,
            HttpClientModule,
            RouterTestingModule,
          ],
        providers: [CommonService],
        schemas: [ScatterplotComponent]
    }).compileComponents();
}));

  beforeEach(() => {
    component = new ScatterplotComponent(vesselObject, compArray, calcService, dateService);
    // fixture.detectChanges();
  });

  it('should create an instance', async(() => {
    expect(component).toBeTruthy();
  }));
});

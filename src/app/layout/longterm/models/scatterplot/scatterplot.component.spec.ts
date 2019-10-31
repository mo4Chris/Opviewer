import { ScatterplotComponent } from './scatterplot.component';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../supportModules/calculation.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { async } from 'q';
import { CommonModule } from '@angular/common';
import { ComprisonArrayElt } from '../scatterInterface';
import { UserTestService } from '../../../../shared/services/test.user.service';

describe('ScatterplotTest', () => {
  let component: ScatterplotComponent;

  const calcService = new CalculationService();
  const dateService = new DatetimeService();
  const user = UserTestService.getMockedAccessToken();
  const vesselObject = {
    mmsi: user.userBoats.map(boat => boat.mmsi),
    dateMin: 747700,
    dateMax: 747750,
    dateNormalMin: 'Test_min',
    dateNormalMax: 'Test_max'
  };
  const compArray: ComprisonArrayElt[] = [{
    x: 'startTime',
    y: 'score',
    graph: 'scatter',
    xLabel: 'Time',
    yLabel: 'Transfer scores',
    dataType: 'transfer'
  }];


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        CommonModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    component = new ScatterplotComponent(vesselObject, compArray, calcService, dateService);
    // fixture.detectChanges();
  });

  // it('should create an instance', () => {
  //   expect(true).toBeTruthy();
  //   // expect(component).toBeTruthy();
  // });
});

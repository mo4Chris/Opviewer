import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ForecastVesselRequest } from '../../forecast-project/forecast-project.component';
import { ForecastMotionLimit } from '../../models/forecast-limit';
import { ForecastOperation, ForecastResponseObject } from '../../models/forecast-response.model';
import { ForecastOperationSettings, YMD } from '../forecast-ops-picker/forecast-ops-picker.component';

@Component({
  selector: 'app-forecast-project-overview',
  templateUrl: './forecast-project-overview.component.html',
  styleUrls: ['./forecast-project-overview.component.scss', '../../forecast.scss']
})
export class ForecastProjectOverviewComponent {
  @Input() selectedTab: string;
  @Input() projects: ForecastOperation[] = [];
  @Input() lastUpdated: string;
  @Input() vessels: ForecastVesselRequest[];
  @Input() response: ForecastResponseObject; // Used for readonly settings
  @Input() selectedProjectId: number;
  @Input() minForecastDate: YMD; // From Response
  @Input() maxForecastDate: YMD; // From Response
  @Input() heading = 0;
  @Input() limits: ForecastMotionLimit[] = [];
  @Input() slipCoefficient = 0;
  @Input() slipCoefficients = [];
  @Input() thrustIndex = 0;
  @Input() slipThrustLevels = [];
  @Input() responseNotFound = false;
  
  @Output() headingChange = new EventEmitter<number>();
  @Output() onChange = new EventEmitter<ForecastOperationSettings>();
  @Output() slipCoefficientChange = new EventEmitter<number>();
  @Output() thrustIndexChange = new EventEmitter<number>();

  onChangeHandler(data){
    this.onChange.emit(data)
  }

  onHeadingChange(data){
    this.headingChange.emit(data)
  }

  onSlipCoefficientChange(data){
    this.slipCoefficientChange.emit(data)
  }
 
  onThrustIndexChange(data){
    this.thrustIndexChange.emit(data)
  }
}

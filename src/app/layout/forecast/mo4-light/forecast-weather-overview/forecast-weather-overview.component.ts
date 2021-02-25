import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { RawWaveData } from '@app/models/wavedataModel';

@Component({
  selector: 'app-forecast-weather-overview',
  templateUrl: './forecast-weather-overview.component.html',
  styleUrls: ['./forecast-weather-overview.component.scss']
})
export class ForecastWeatherOverviewComponent implements OnChanges {
  @Input() weather: RawWaveData;
  public source = 'not available';

  constructor() { }

  ngOnChanges(): void {
    this.source = this?.weather?.source ?? 'not available';
  }

}

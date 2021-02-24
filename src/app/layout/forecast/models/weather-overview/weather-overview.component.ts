import { Component, Input, OnInit } from '@angular/core';
import { WeatherOverviewChart } from '@app/layout/reports/dpr/models/weatherChart';
import { RawWaveData } from '@app/models/wavedataModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SettingsService } from '@app/supportModules/settings.service';

@Component({
  selector: 'app-weather-overview',
  templateUrl: './weather-overview.component.html',
  styleUrls: ['./weather-overview.component.scss']
})
export class WeatherOverviewComponent implements OnInit {
  @Input() source: string;
  @Input() weather: RawWaveData;
  @Input() units = {
    Hs: 'm',
    Ts: 's',
    Tp: 's',
    Tz: 's',
    Hmax: 'm',
    waveDir: 'deg',
    wavePeakDir: 'deg'
  };
  @Input() events: EventInput[];

  public chart;

  constructor(
    private calculationService: CalculationService,
    private settings: SettingsService,
    private dateService: DatetimeService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    if (this.chart) this.chart = null;
    if (!this.weather) return;
    this.draw();
  }

  draw() {
    console.log(this)
    const id = document.getElementById('weatherOverview');
    const timeStamps = this.weather.timeStamp.map(
      matlabTime => this.dateService.matlabDatenumToMoment(matlabTime).toISOString(false)
    );


    const validLabels = this.getValidLabel(this.weather);
    // Parsing the main datasets
    const dsets: any[] = [];
    validLabels.forEach((label, __i) => {
      dsets.push({
        label: label,
        data: this.weather[label].map((elt: number, _i: number) => {
          return { x: timeStamps[_i], y: elt };
        }),
        pointHoverRadius: 5,
        pointHitRadius: 30,
        pointRadius: 0,
        borderWidth: 2,
        unit: this.units[label],
        fill: false,
        yAxisID: this.getAxisId(label)
      });
    });

    this.chart = new WeatherOverviewChart({
      dsets: dsets,
      timeStamps: timeStamps,
      wavedataSourceName: `Source: ${this.source}`,
      utcOffset: 0,
    }, this.calculationService, this.settings, id);
  }

  private getValidLabel(obj: RawWaveData): string[] {
    const valid = new Array<string>();
    Object.keys(obj).forEach(key => {
      if (key!='timeStamp' && obj[key]?.length>0) {
        valid.push(key);
      } 
    });
    return valid;
  }

  private getAxisId(id: string) {
    switch (id) {
      case 'Hs': case 'Hmax':
        return 'Hs'
      case 'windDir': case 'waveDir': case 'direction':
        return 'waveDir'
      case 'Tp': case 'Tz': case 'T0':
        return 'Tp';
      case 'Wind': case 'WindSpeed': case 'WindAvg': case 'WindGust':
        return 'Wind'
      default:
        // This may crash but is far more flexible
        return 'hidden'
    }
  }
}

interface EventInput {
  name: string;
  start: number[];
  stop: number[];
  color?: any;
}

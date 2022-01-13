import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-weather-forecast-graph',
  templateUrl: './weather-forecast-graph.component.html',
  styleUrls: ['./weather-forecast-graph.component.scss']
})
export class WeatherForecastGraphComponent implements OnInit{
  
  selectedView = 'general';
  testEmitter$ = new BehaviorSubject<string>(this.selectedView);

  constructor()  {}
  
  ngOnInit(): void {
    
  }

  updateView(newView) {
    this.selectedView = newView;
    this.testEmitter$.next(newView);
    console.log(this);
  }

}

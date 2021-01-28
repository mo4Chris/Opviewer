import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forecast-project',
  templateUrl: './forecast-project.component.html',
  styleUrls: ['./forecast-project.component.scss']
})
export class ForecastProjectComponent implements OnInit {

  public project_id;

  constructor() { }

  ngOnInit() {
    console.log('Forecast component onInit')
  }

}

import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-forecast-workability-surface',
  templateUrl: './forecast-workability-surface.component.html',
  styleUrls: ['./forecast-workability-surface.component.scss']
})
export class ForecastWorkabilitySurfaceComponent implements OnChanges {
  @Input() vessel_id;

  constructor() { }

  ngOnChanges() {
    this.loadSurfaceData();
  }

  loadSurfaceData() {

  }
}

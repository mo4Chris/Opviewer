import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-vessel-location-indicator',
  templateUrl: './vessel-location-indicator.component.html',
  styleUrls: ['./vessel-location-indicator.component.scss']
})
export class VesselLocationIndicatorComponent implements OnInit {
  @Input() Length = 20;
  @Input() Width = 10;
  @Input() Height = 10;
  @Input() X: number = 1;
  @Input() Y: number = 2;
  @Input() Z: number = 3;

  constructor() { }

  ngOnInit() {
  }

}

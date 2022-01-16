import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-weather-icons',
  templateUrl: './weather-icons.component.html',
  styleUrls: ['./weather-icons.component.scss']
})
export class WeatherIconsComponent {
  @Input() weatherIconType: string
  @Input() day: string
  @Output() click = new EventEmitter();

  onClick(event: Event): void {
    this.click.emit(event)
  }

}

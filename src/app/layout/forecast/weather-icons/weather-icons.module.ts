import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherIconsComponent } from './weather-icons/weather-icons.component';



@NgModule({
  declarations: [WeatherIconsComponent],
  imports: [
    CommonModule
  ],
  exports: [WeatherIconsComponent]
})
export class WeatherIconsModule { }

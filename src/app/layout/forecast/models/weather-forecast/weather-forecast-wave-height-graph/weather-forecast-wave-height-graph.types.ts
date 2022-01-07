import { WeatherForecastGraphData } from "../weather-forecast.types";

export enum WEATHER_FORECAST_WAVE_TYPE {
    HS = 'hs',
    HMAX = 'hMax',
    TZ ='tz'
  }
   

  export interface WeatherForecastWaveGraphMeta {
    generalInformation:  GeneralInformation;
    waveWeatherForecast: WaveWeatherForecast[];
}

export interface GeneralInformation {
    timeStamp: string;
    provider:  string;
}

export interface WaveWeatherForecast {
    frequencies: Directions;
    directions:  Directions;
    dateTime:    WeatherForecastGraphData;
    dateNum:     WeatherForecastGraphData;
    hs:          WeatherForecastGraphData;
    hMax:        WeatherForecastGraphData;
    tz:          WeatherForecastGraphData;
}


export interface Directions {
    Data:     number[];
    Units:    string;
    Type:     string;
    dataType: string;
}


export interface WeatherForecastWaveGraphData {
    type:     string;
    units:    string;
    dataType: string;
    val:      any;
    index:    number;
}

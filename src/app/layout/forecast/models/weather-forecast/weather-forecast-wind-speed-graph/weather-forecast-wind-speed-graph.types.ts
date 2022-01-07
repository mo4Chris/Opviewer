import { WeatherForecastGraphData } from "../weather-forecast.types";

export enum WEATHER_FORECAST_WIND_TYPE {
    SPEED = 'speed',
    GUST = 'gust',
    DIRECTIONS = 'directions',
  }
  export interface WeatherForecastWindPlotData {
    plotLayout: Partial<Plotly.Layout>;
    data:       Datum[];
}

export interface Datum {
    meta:        WeatherForecastWindGraphMeta;
    x:           Date[];
    y:           number[];
    hovertext:   string[];
    type:        string;
    connectgaps: boolean;
    mode:        string;
    hoverinfo:   string;
    name:        string;
}

export interface WeatherForecastWindGraphMeta {
    generalInformation:  GeneralInformation;
    weatherForecastWind: WeatherForecastWind[];
}

export interface GeneralInformation {
    timeStamp: string;
    provider:  string;
}

export interface WeatherForecastWind {
    dateTime:   WeatherForecastGraphData;
    dateNum:    WeatherForecastGraphData;
    speed:      WeatherForecastGraphData;
    gust:       WeatherForecastGraphData;
    directions: WeatherForecastGraphData;
}

export interface WindGraphInformation {
    metaInfo:     MetaInfo;
    degreesClass: string;
}

export interface MetaInfo {
    timeStamp:       string;
    provider:        string;
    weatherForecast: WeatherForecastWind;
}

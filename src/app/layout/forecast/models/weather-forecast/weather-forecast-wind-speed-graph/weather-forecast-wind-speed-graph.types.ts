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
    meta:        Meta;
    x:           Date[];
    y:           number[];
    hovertext:   string[];
    type:        string;
    connectgaps: boolean;
    mode:        string;
    hoverinfo:   string;
    name:        string;
}

export interface Meta {
    generalInformation:  GeneralInformation;
    weatherForecastWind: WeatherForecastWind[];
}

export interface GeneralInformation {
    timeStamp: string;
    provider:  string;
}

export interface WeatherForecastWind {
    dateTime:   WeatherForecastWindData;
    dateNum:    WeatherForecastWindData;
    speed:      WeatherForecastWindData;
    gust:       WeatherForecastWindData;
    directions: WeatherForecastWindData;
}

export interface WeatherForecastWindData {
    units:    string;
    type:     string;
    dataType: string;
    val:      number | string;
    index:    number;
}


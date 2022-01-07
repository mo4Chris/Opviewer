export interface WeatherForecastPlotlyData {
    plotData:   PlotDatum[];
    plotLayout: Partial<Plotly.Layout>;
}

export interface PlotDatum {
    x:           Date[];
    y:           number[];
    type:        string;
    name:        string;
    connectgaps: boolean;
    marker:      Marker;
}

export interface Marker {
    color: string;
}

export enum WEATHER_FORECAST_OPTIONS_TYPE {
    TEMPERATURE = 'temperature',
    VISIBILITY = 'visibility',
    HUMIDITY = 'humidity',
    PRESSURE = 'pressure'
  }
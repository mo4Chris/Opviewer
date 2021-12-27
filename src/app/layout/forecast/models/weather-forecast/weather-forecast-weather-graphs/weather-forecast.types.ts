export interface WeatherForecastDayResult {
    Data: Array<number | string>;
    Units: any[] | string;
    Type: any[] | string;
    dataType: string;
    val: any | number | string;
    index: number;
}

export interface WeatherForecastDailySummaryInformation {
    Data:     Array<number | string>;
    Units:    any[] | string;
    Type:     any[] | string;
    dataType: string;
}

export interface WeatherForecastHourChartInformation {
    day:        string;
    visibility: number;
    dateNum:    string;
    hour:       string;
    date:       string;
}


export type DayReport = {
    daySummary: string,
    date: string,
    day: string,
    dateIcon: string,
    timeOfSunrise: string,
    timeOfSunset: string,
    temperatureLow: ExtendedDataType,
    temperatureHigh: ExtendedDataType,
    precipitationProbability: ExtendedDataType,
    precipitationIntensity: ExtendedDataType,
    visibility: number,
    windSpeed: ExtendedDataType,
    windGust: ExtendedDataType,
    windDirection: ExtendedDataType,
    dateGraphInformation: WeatherForecastHourChartInformation[]
}

type ExtendedDataType = {
    val: number ,
    unit: string | any[],
}
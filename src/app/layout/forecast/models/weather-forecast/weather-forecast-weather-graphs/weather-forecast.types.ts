export interface WeatherForecastDayResult {
  units: any[] | string;
  type: any[] | string;
  dataType: string;
  val: any | number | string;
  index: number;
}

export interface WeatherForecastHourChartInformation {
  day: string;
  formattedDate: string;
  temperature: ExtendedDataType;
  visibility: ExtendedDataType;
  dateNum: string;
  hour: string;
  icon: string;
  date: Date | string;
  pressure: ExtendedDataType;
  humidity: ExtendedDataType;
}


export interface DayReport {
  daySummary: string;
  date: string;
  day: string;
  dateIcon: string;
  timeOfSunrise: string;
  timeOfSunset: string;
  temperatureLow: ExtendedDataType;
  temperatureHigh: ExtendedDataType;
  precipitationProbability: ExtendedDataType;
  precipitationIntensity: ExtendedDataType;
  visibility: number;
  windSpeed: ExtendedDataType;
  windGust: ExtendedDataType;
  windDirection: ExtendedDataType;
  dateGraphInformation: WeatherForecastHourChartInformation[];
}

interface ExtendedDataType {
  val: number;
  unit: string | any[];
}

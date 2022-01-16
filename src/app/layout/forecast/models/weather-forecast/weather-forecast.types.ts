export interface WeatherForecast {
    General:      General;
    Wave:         Wave;
    Wind:         Wind;
    Current:      Current;
    Air:          Air;
    DailySummary: DailySummary;
}

export interface Air {
    DateTime:                 DateTime;
    DateNum:                  DateNum;
    Icon:                     Icon;
    Temperature:              Humidity;
    Humidity:                 Humidity;
    PrecipitationType:        DateTime;
    PrecipitationProbability: PrecipitationProbability;
    PrecipitationIntensity:   Humidity;
    Pressure:                 Humidity;
    Visibility:               Humidity;
}

export interface DateNum {
    Data:  number[];
    Units: any[];
    Type:  any[];
}

export interface DateTime {
    Data:  string[];
    Units: any[];
    Type:  any[];
}

export interface Humidity {
    Data:  number[];
    Units: string;
    Type:  any[];
}

export interface Icon {
    Data:  Array<any[] | DatumEnum>;
    Units: any[];
    Type:  any[];
}

export enum DatumEnum {
    ClearDay = "clear-day",
    ClearNight = "clear-night",
    Cloudy = "cloudy",
    PartlyCloudyDay = "partly-cloudy-day",
    PartlyCloudyNight = "partly-cloudy-night",
    Rain = "rain",
}

export interface PrecipitationProbability {
    Data:  number[];
    Units: string;
    Type:  string;
}

export interface Current {
    Header:     DateNum;
    DateTime:   DateNum;
    DateNum:    DateNum;
    Speed:      DateNum;
    Directions: DateNum;
}

export interface DailySummary {
    Summary:                  DateTime;
    DateTime:                 DateTime;
    DateNum:                  DateNum;
    Icon:                     DateTime;
    Sunrise:                  DateTime;
    Sunset:                   DateTime;
    TemperatureLow:           Humidity;
    TemperatureHigh:          Humidity;
    PrecipitationProbability: DateNum;
    PrecipitationIntensity:   Humidity;
    Visibility:               DateNum;
    WindSpeed:                Humidity;
    WindGust:                 Humidity;
    WindDirection:            PrecipitationProbability;
}

export interface General {
    Header:      DateNum;
    Forecaster:  Forecaster;
    RefDateNum:  Latitude;
    Latitude:    Latitude;
    Longitude:   Latitude;
    Routename:   ProjectInfo;
    WaterDepth:  WaterDepth;
    ProjectInfo: ProjectInfo;
}

export interface Forecaster {
    Data:  string;
    Units: any[];
    Type:  string;
}

export interface Latitude {
    Data:  number;
    Units: any[];
    Type:  string;
}

export interface ProjectInfo {
    Data:  string;
    Units: any[];
    Type:  any[];
}

export interface WaterDepth {
    Data:  any[];
    Units: any[];
    Type:  string;
}

export interface Wave {
    Header:           Forecaster;
    DateTime:         WaveDateTime;
    DateNum:          PrecipitationProbability;
    Frequencies:      PrecipitationProbability;
    Directions:       PrecipitationProbability;
    Density:          Density;
    Hs:               PrecipitationProbability;
    Hmax:             PrecipitationProbability;
    Tz:               PrecipitationProbability;
    WindSeaHs:        DateNum;
    WindSeaTp:        DateNum;
    WindSeaDir:       DateNum;
    SwellSeaHs:       DateNum;
    SwellSeaTp:       DateNum;
    SwellSeaDir:      DateNum;
    CartesianDensity: CartesianDensity;
}

export interface CartesianDensity {
    Kx:      PrecipitationProbability;
    Ky:      PrecipitationProbability;
    Density: PrecipitationProbability;
}

export interface WaveDateTime {
    Data:  string[];
    Units: string;
    Type:  string;
}

export interface Density {
    Data:  Array<Array<number[]>>;
    Units: string;
    Type:  string;
}

export interface Wind {
    Header:     Forecaster;
    DateTime:   WaveDateTime;
    DateNum:    PrecipitationProbability;
    Speed:      PrecipitationProbability;
    Gust:       PrecipitationProbability;
    Directions: PrecipitationProbability;
}

import { WeatherForecast } from '../weather-forecast.types';
import { WeatherForecastWeatherGraphsService } from './weather-forecast-weather-graphs.service';
import { DayReport, WeatherForecastDayResult, WeatherForecastHourChartInformation } from './weather-forecast.types';

describe('WeatherForecastWeatherGraphsService', () => {
  let service: WeatherForecastWeatherGraphsService;

  beforeEach(() => {
    service = new WeatherForecastWeatherGraphsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('factorDailyWeatherForecastData', () => {
    it('should create the daily weather forecast data', () => {
      const weatherForecast = {
        "Air": {
          "DateTime": {
            "Data": [
              "18-Aug-2021 09:00:00",
            ],
          },
          "DateNum": {
            "Data": [
              738386.375,
            ],
          },
        },
        "DailySummary": {
          "Summary": {
            "Data": [
              "Rain starting in the afternoon.",
            ],
          },
          "DateTime": {
            "Data": [
              "06-Aug-2021",
            ],
          },
          "DateNum": {
            "Data": [
              738374,
            ],
          },
          "Icon": {
            "Data": [
              "rain",
            ],
          },
          "Sunrise": {
            "Data": [
              "06-Aug-2021 05:46:00",
            ],
          },
          "Sunset": {
            "Data": [
              "06-Aug-2021 21:26:00",
            ],
          },
          "TemperatureLow": {
            "Data": [
              16.14,
            ],
            "Units": "degrees Celcius",
          },
          "TemperatureHigh": {
            "Data": [
              20.17,
            ],
            "Units": "degrees Celcius",
          },
          "PrecipitationProbability": {
            "Data": [
              0.82,
            ],
            "Units":[]
          },
          "PrecipitationIntensity": {
            "Data": [
              0.5034,
            ],
            "Units": "mm/hour",
          },
          "Visibility": {
            "Data": [
              16.008,
            ],
          },
          "WindSpeed": {
            "Data": [
              9.34,
            ],
            "Units": "m/s",
          },
          "WindGust": {
            "Data": [
              13.27,
            ],
            "Units": "m/s",
          },
          "WindDirection": {
            "Data": [
              137,
            ],
            "Units": "degrees",
            "Type": "Coming from, compass directions, true north at 0deg"
          }
        }
      }
      const actual = service.factorDailyWeatherForecastData(weatherForecast as WeatherForecast)
      const expected = [
        {
            "daySummary": "Rain starting in the afternoon.",
            "date": "Friday, 06 August",
            "day": "Fri",
            "dateIcon": "rain",
            "timeOfSunrise": "05:46",
            "timeOfSunset": "21:26",
            "temperatureLow": {
                "val": 16.14,
                "unit": "degrees Celcius"
            },
            "temperatureHigh": {
                "val": 20.17,
                "unit": "degrees Celcius"
            },
            "precipitationProbability": {
                "val": 0.82,
                "unit": []
            },
            "precipitationIntensity": {
                "val": 0.5034,
                "unit": "mm/hour"
            },
            "visibility": 16.008,
            "windSpeed": {
                "val": 9.34,
                "unit": "m/s"
            },
            "windGust": {
                "val": 13.27,
                "unit": "m/s"
            },
            "windDirection": {
                "val": 137,
                "unit": "degrees"
            },
            "dateGraphInformation": []
        }
    ]
      expect(actual).toEqual(expected)
    })
  })
  describe('getDataStructure', () => {

    it('should add the keys of the Air object to the object as dataType', () => {
      const input = {
        DailySummary: {
          'val': {
            Data: ['val']
          }
        }
      } as unknown as WeatherForecast
      const actual = service.getDataStructure(input);
      const expected: any = [
        [
          {
            "Data": [
              "val"
            ],
            "dataType": "VAL",
            "val": "val",
            "index": 0
          }
        ]
      ]

      expect(actual).toEqual(expected);
    })
  })
  describe('createNewDataObjectWithIndex', () => {
    it('should add the keys of the Air object to the object as dataType', () => {
      const input = {
        Data: ['val', 'val2', 'val3']
      } as unknown as WeatherForecast
      const actual = service.createNewDataObjectWithIndex(input);
      const expected: any = [{ Data: ['val', 'val2', 'val3'], val: 'val', index: 0 }, { Data: ['val', 'val2', 'val3'], val: 'val2', index: 1 }, { Data: ['val', 'val2', 'val3'], val: 'val3', index: 2 }]

      expect(actual).toEqual(expected);
    })
  })
  describe('factorDailySummeryInformation', () => {
    it('should add the keys of the dailySummary object to the object as dataType', () => {
      const input = {
        DailySummary: {
          'val': {}
        }
      } as unknown as WeatherForecast
      const actual = service.factorDailySummeryInformation(input);
      const expected: any = [{ dataType: 'VAL' }]

      expect(actual).toEqual(expected);
    })
  })
  describe('factorAirData', () => {
    it('should add the keys of the Air object to the object as dataType', () => {
      const input = {
        Air: {
          'val': {}
        }
      } as unknown as WeatherForecast
      const actual = service.factorAirData(input);
      const expected: any = [{ dataType: 'VAL' }]

      expect(actual).toEqual(expected);
    })
  })



  describe('factorAirInformation', () => {
    it('should return WeatherForecastHourChartInformation[][]', () => {
      const weatherForecast = {
        "Air": {
          "DateTime": {
            "Data": [
              "18-Aug-2021 09:00:00",
              "18-Aug-2021 10:00:00",
            ],
          },
          "DateNum": {
            "Data": [
              738386.375,
              738386.4166666666,
            ],
          },
        },
      }
      const actual = service.factorAirInformation((weatherForecast as unknown as WeatherForecast))
      const expected: any = [
        [
          { day: 'Wed', visibility: { val: undefined, unit: undefined }, temperature: { val: undefined, unit: undefined }, dateNum: '738386', hour: '09:00', formattedDate: 'Wednesday, 18 August' , date: new Date('Wed Aug 18 2021 09:00:00 GMT+0200 (Central European Summer Time)'),
          icon: undefined, pressure: { val: undefined, unit: undefined }, humidity: { val: undefined, unit: undefined }},
          { day: 'Wed', visibility: { val: undefined, unit: undefined }, temperature: { val: undefined, unit: undefined }, dateNum: '738386', hour: '10:00', formattedDate: 'Wednesday, 18 August' , date: new Date('Wed Aug 18 2021 10:00:00 GMT+0200 (Central European Summer Time)'),
          icon: undefined, pressure: { val: undefined, unit: undefined }, humidity: { val: undefined, unit: undefined }}
        ]
      ]
      expect(actual).toEqual(expected);
    })
  })

  describe('createDayReports', () => {
    it('should create a day Report', () => {
      const input: WeatherForecastDayResult[][] = [[
        {
          "Units": [],
          "Type": [],
          "dataType": "SUMMARY",
          "val": "Partly cloudy throughout the day.",
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "DATETIME",
          "val": "18-Aug-2021",
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "DATENUM",
          "val": 738386,
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "ICON",
          "val": "partly-cloudy-day",
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "SUNRISE",
          "val": "18-Aug-2021 07:13:00",
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "SUNSET",
          "val": "18-Aug-2021 21:18:00",
          "index": 0
        },
        {
          "Units": "degrees Celcius",
          "Type": [],
          "dataType": "TEMPERATURELOW",
          "val": 16.71,
          "index": 0
        },
        {
          "Units": "degrees Celcius",
          "Type": [],
          "dataType": "TEMPERATUREHIGH",
          "val": 19.48,
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "PRECIPITATIONPROBABILITY",
          "val": 0.03,
          "index": 0
        },
        {
          "Units": "mm/hour",
          "Type": [],
          "dataType": "PRECIPITATIONINTENSITY",
          "val": 0.0009,
          "index": 0
        },
        {
          "Units": [],
          "Type": [],
          "dataType": "VISIBILITY",
          "val": 16.093,
          "index": 0
        },
        {
          "Units": "m/s",
          "Type": [],
          "dataType": "WINDSPEED",
          "val": 4.95,
          "index": 0
        },
        {
          "Units": "m/s",
          "Type": [],
          "dataType": "WINDGUST",
          "val": 7.57,
          "index": 0
        },
        {
          "Units": "degrees",
          "Type": "Coming from, compass directions, true north at 0deg",
          "dataType": "WINDDIRECTION",
          "val": 310,
          "index": 0
        }
      ]] as WeatherForecastDayResult[][]
      const weatherForecastHourChartInformation: WeatherForecastHourChartInformation[][] = [[{ formattedDate: 'Wednesday, 18 August' } as unknown as WeatherForecastHourChartInformation]]
      const actual = service.createDayReports(input, weatherForecastHourChartInformation)

      const expected: any = [
        {
          "daySummary": "Partly cloudy throughout the day.",
          "date": "Wednesday, 18 August",
          "day": "Wed",
          "dateIcon": "partly-cloudy-day",
          "timeOfSunrise": "07:13",
          "timeOfSunset": "21:18",
          "temperatureLow": {
            "val": 16.71,
            "unit": "degrees Celcius"
          },
          "temperatureHigh": {
            "val": 19.48,
            "unit": "degrees Celcius"
          },
          "precipitationProbability": {
            "val": 0.03,
            "unit": []
          },
          "precipitationIntensity": {
            "val": 0.0009,
            "unit": "mm/hour"
          },
          "visibility": 16.093,
          "windSpeed": {
            "val": 4.95,
            "unit": "m/s"
          },
          "windGust": {
            "val": 7.57,
            "unit": "m/s"
          },
          "windDirection": {
            "val": 310,
            "unit": "degrees"
          },
          "dateGraphInformation": [
            {
              "formattedDate": "Wednesday, 18 August"
            }
          ]
        }
      ]
      expect(actual).toEqual(expected);
    })

    it('should not fail when values are missing from the retrieved list and still create a day report', () => {
      const input: WeatherForecastDayResult[][] = [[]] as WeatherForecastDayResult[][]
      const weatherForecastHourChartInformation: WeatherForecastHourChartInformation[][] = [[]]
      const actual = service.createDayReports(input, weatherForecastHourChartInformation)
      const expected: any = [
        {
          "daySummary": undefined,
          "dateIcon": undefined,
          "date": "",
          "day": "",
          "timeOfSunrise": "",
          "timeOfSunset": "",
          "temperatureLow": {
            val: undefined,
            unit: undefined
          },
          "temperatureHigh": {
            val: undefined,
            unit: undefined
          },
          "precipitationProbability": {
            val: undefined,
            unit: undefined
          },
          "precipitationIntensity": {
            val: undefined,
            unit: undefined
          },
          "visibility": undefined,
          "windSpeed": {
            val: undefined,
            unit: undefined
          },
          "windGust": {
            val: undefined,
            unit: undefined
          },
          "windDirection": {
            val: undefined,
            unit: undefined
          },
          "dateGraphInformation": []
        }
      ]
      expect(actual).toEqual(expected);
    })
  })

  describe('createTemperatureChartReport', () => {
    it('should create a temperature ChartReport', () => {
      const input: WeatherForecastDayResult[][] = [[{ dataType: 'DATETIME', val: "18-Aug-2021 09:00:00" }, { dataType: 'VISIBILITY', val: '23' , Units: 'lolo' },
      { dataType: 'TEMPERATURE', val: '23', Units: 'degrees celcius' }, { dataType: 'DATENUM', val: 1234.00000 }, { dataType: 'ICON', val: 'CLOUDY DAY' }, { dataType: 'PRESSURE', val: 1234.00000 , Units: 'kakak'}, { dataType: 'HUMIDITY', val: 1234.00000, Units:'lala' }
      ]] as WeatherForecastDayResult[][]

      const actual = service.createTemperatureChartReport(input)

      const expected: any = [
        {
          "day": "Wed",
          "visibility": {
              "val": "23",
              "unit": 'lolo'
          },
          "temperature": {
              "val": "23",
              "unit": 'degrees celcius'
          },
          "dateNum": "1234",
          "hour": "09:00",
          "date": new Date("2021-08-18T07:00:00.000Z"),
          "formattedDate": "Wednesday, 18 August",
          "icon": "CLOUDY DAY",
          "pressure": {
              "val": 1234,
              "unit": "kakak"
          },
          "humidity": {
              "val": 1234,
              "unit": "lala"
          }
      }
    ]

      expect(actual).toEqual(expected);
    })

    it('should create a temperature chart report with all values undefined or  if they cannot be found', () => {
      const input: WeatherForecastDayResult[][] = [[]] as WeatherForecastDayResult[][]

      const actual = service.createTemperatureChartReport(input)
      const expected: any = [
        {
            "day": "",
            "dateNum": undefined,
            "icon": undefined,
            "visibility": {
              val: undefined,
              unit: undefined
            },
            "temperature": {
              val: undefined,
              unit: undefined
            },
            "hour": "",
            "date": '',
            "formattedDate": "",
            "pressure": {
              val: undefined,
              unit: undefined
            },
            "humidity": {
              val: undefined,
              unit: undefined
            }
        }
    ]

      expect(actual).toEqual(expected);
    })
  })

  describe('getTemperatureValues', () => {
    it('should retrieve the object values for temperature types', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'TEMPERATURELOW', val: 12.9, Units: 'degrees' } as WeatherForecastDayResult]
      const actual = service.getExtendedValues(input, 'TEMPERATURELOW')
      const expected: any = {
        val: 12.9,
        unit: 'degrees'
      }
      expect(actual).toEqual(expected);
    })
  })
  describe('getValue', () => {
    it('should get the value property from the requested dateType', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATENUM', val: 123.999 } as WeatherForecastDayResult]
      const actual = service.getValue(input, 'DATENUM')
      const expected: any = 123.999
      expect(actual).toEqual(expected);
    })
  })
  describe('getDateNum', () => {
    it('should get the value from datenum before the .', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATENUM', val: 123.999 } as WeatherForecastDayResult]
      const actual = service.getDateNum(input)
      const expected: any = '123'
      expect(actual).toEqual(expected);
    })
  })

  describe('createFormattedDate', () => {
    it('should create a formatted date in format dddd, DD MMMM', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATETIME', val: "18-Aug-2021 09:00:00" } as WeatherForecastDayResult]
      const actual = service.createFormattedDate(input)
      const expected: any = 'Wednesday, 18 August'
      expect(actual).toEqual(expected);
    })
  })

  describe('createFormattedDay', () => {
    it('should create a formatted date in format ddd', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATETIME', val: "18-Aug-2021 09:00:00" } as WeatherForecastDayResult]
      const actual = service.createFormattedDay(input)
      const expected: any = 'Wed'
      expect(actual).toEqual(expected);
    })
  })
  describe('createSunriseHour', () => {
    it('should create a formatted date in format hh:mm', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'SUNRISE', val: "18-Aug-2021 09:00:00" } as WeatherForecastDayResult]
      const actual = service.createSunriseHour(input)
      const expected: any = '09:00'
      expect(actual).toEqual(expected);
    })
  })
  describe('createHour', () => {
    it('should create a formatted date in format HH:mm for the morning', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATETIME', val: "18-Aug-2021 09:00:00" } as WeatherForecastDayResult]
      const actual = service.createHour(input)
      const expected: any = '09:00'
      expect(actual).toEqual(expected);
    })
   
    it('should create a formatted date in format HH:mm for the afternoon', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'DATETIME', val: "18-Aug-2021 19:00:00" } as WeatherForecastDayResult]
      const actual = service.createHour(input)
      const expected: any = '19:00'
      expect(actual).toEqual(expected);
    })
  })
  describe('createSunSetHour', () => {
    it('should create a formatted date in format hh:mm', () => {
      const input: WeatherForecastDayResult[] = [{ dataType: 'SUNSET', val: "18-Aug-2021 09:00:00" } as WeatherForecastDayResult]
      const actual = service.createSunSetHour(input)
      const expected: any = '09:00'
      expect(actual).toEqual(expected);
    })
  })

  describe('getDateGraphInformation', () => {
    it('should be created', () => {
      const dateGraphInformation = [
        [
          {
            "day": "Fri",
            "visibility": 16.093,
            "temperature": 16.58,
            "dateNum": "738374",
            "hour": "10:00",
            "formattedDate": 'Monday, 06 August'
          },
        ],
        [
          {
            "day": "Sat",
            "visibility": 16.093,
            "temperature": 16.41,
            "dateNum": "738375",
            "hour": "12:00",
            "formattedDate": "Saturday, 07 August"
          },
        ]
      ] as unknown as WeatherForecastHourChartInformation[][]
      const data = [{
        "dataType": "DATETIME",
        "val": 'Monday, 06 August',
      }] as WeatherForecastDayResult[];

      const actual = service.getDateGraphInformation(dateGraphInformation, data)
      const expected = [{
        "day": "Fri",
        "visibility": 16.093,
        "temperature": 16.58,
        "dateNum": "738374",
        "hour": "10:00",
        "formattedDate": "Monday, 06 August"
      }]
      expect(actual).toEqual(expected);
    })
  })

  describe('filterSameDates', () => {
    it('should return a list of the same day', () => {
      const input: WeatherForecastHourChartInformation[] = [{ formattedDate: 'Wednesday, 18 August' }, { formattedDate: 'Wednesday, 18 August' }, { formattedDate: 'Wednesday, 25 August' }] as WeatherForecastHourChartInformation[]
      const date = 'Wednesday, 18 August'

      const actual = service.filterSameDates(input, date)
      const expected: any = [{ formattedDate: 'Wednesday, 18 August' }, { formattedDate: 'Wednesday, 18 August' }]

      expect(actual).toEqual(expected);
    })

  })

});

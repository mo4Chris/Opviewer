import { WeatherForecast } from '../weather-forecast.types';
import { WeatherForecastWindSpeedGraphService } from './weather-forecast-wind-speed-graph.service';
import { WeatherForecastWindGraphMeta, WeatherForecastWind } from './weather-forecast-wind-speed-graph.types';

describe('WeatherForecastWindSpeedGraphService', () => {
  let service: WeatherForecastWindSpeedGraphService;
  let dateTimeServiceMock
  beforeEach(() => {
    dateTimeServiceMock = jasmine.createSpyObj('DatetimeService', ['matlabDatenumToDate'])
    service = new WeatherForecastWindSpeedGraphService(dateTimeServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlotData', () => {
    it('should retrieve plot data', () => {
      const input = [
        {
          "General": {
            "Forecaster": {
              "Data": "DTN",
              "Units": [],
              "Type": "Forecasting company"
            },
            "RefDateNum": {
              "Data": 738533.2506944444,
              "Units": [],
              "Type": "Wave"
            },
            "Routename": {
              "Data": "FC_DTN_20220112_0501_Point_47.157_-2.6057",
              "Units": [],
              "Type": []
            },
          },
          "Wind": {
            "DateTime": {
              "Data": [
                "12-Jan-2022 05:00:00",
              ],
              "Units": "DateTime",
              "Type": "Forecast time"
            },
            "DateNum": {
              "Data": [
                738533.2083333334,
              ],
              "Units": "DateNum",
              "Type": "Forecast time"
            },
            "Speed": {
              "Data": [
                3.3,
              ],
              "Units": "m/s",
              "Type": "Wind speed 10m"
            },
            "Gust": {
              "Data": [
                4.3,
              ],
              "Units": "m/s",
              "Type": "Wind gust 10m"
            },
            "Directions": {
              "Data": [
                83,
              ],
              "Units": "degrees",
              "Type": "Wind direction (coming from)"
            }
          },
        }
      ] as WeatherForecast[]
      dateTimeServiceMock.matlabDatenumToDate.and.returnValue(new Date(1, 1, 1))
      const actual = service.getPlotData(input, 'speed')
      const expected: any = {
        "plotLayout": {
          "title": "Wind speed 10m",
          "width": 800,
          "height": 450,
          "yaxis": {
            "range": [
              0,
              4
            ],
            "title": "m/s",
            "fixedrange": true
          },
          "xaxis": {
            "automargin": true,
            "type": "date"
          },
          "legend": {
            "x": 1,
            "y": 1,
            "xanchor": "right"
          },
          "margin": {
            "t": 40,
            "b": 0,
            "l": 60,
            "r": 40
          }
        },
        "data": [
          {
            "meta": {
              "generalInformation": {
                "timeStamp": '01 02 1901, 00:00',
                "provider": "DTN"
              },
              "weatherForecastWind": [
                {
                  "dateTime": {
                    "units": "DateTime",
                    "type": "Forecast time",
                    "dataType": "DATETIME",
                    "val": "12-Jan-2022 05:00:00",
                    "index": 0
                  },
                  "dateNum": {
                    "units": "DateNum",
                    "type": "Forecast time",
                    "dataType": "DATENUM",
                    "val": 738533.2083333334,
                    "index": 0
                  },
                  "speed": {
                    "units": "m/s",
                    "type": "Wind speed 10m",
                    "dataType": "SPEED",
                    "val": 3.3,
                    "index": 0
                  },
                  "gust": {
                    "units": "m/s",
                    "type": "Wind gust 10m",
                    "dataType": "GUST",
                    "val": 4.3,
                    "index": 0
                  },
                  "directions": {
                    "units": "degrees",
                    "type": "Wind direction (coming from)",
                    "dataType": "DIRECTIONS",
                    "val": 83,
                    "index": 0
                  }
                }
              ]
            },
            "x": [
              new Date("2022-01-12T04:00:00.000Z")
            ],
            "y": [
              3.3
            ],
            "hovertext": [
              "3.3 m/s, 83 degrees"
            ],
            "type": "scatter",
            "connectgaps": false,
            "mode": "lines",
            "hoverinfo": "text",
            "name": "DTN, 01 02 1901, 00:00"
          }
        ]
      }

      expect(actual).toEqual(expected)
    })
  })
  describe('getWindDataWeatherForecast', () => {
    it('should retrieve data for weather forecast', () => {
      const input = {
        "General": {
          "Forecaster": {
            "Data": "DTN",
            "Units": [],
            "Type": "Forecasting company"
          },
          "RefDateNum": {
            "Data": 738533.2506944444,
            "Units": [],
            "Type": "Wave"
          },
          "Routename": {
            "Data": "FC_DTN_20220112_0501_Point_47.157_-2.6057",
            "Units": [],
            "Type": []
          },
        },
        "Wind": {
          "DateTime": {
            "Data": [
              "12-Jan-2022 05:00:00",
            ],
            "Units": "DateTime",
            "Type": "Forecast time"
          },
          "DateNum": {
            "Data": [
              738533.2083333334,
            ],
            "Units": "DateNum",
            "Type": "Forecast time"
          },
          "Speed": {
            "Data": [
              3.3,
            ],
            "Units": "m/s",
            "Type": "Wind speed 10m"
          },
          "Gust": {
            "Data": [
              4.3,
            ],
            "Units": "m/s",
            "Type": "Wind gust 10m"
          },
          "Directions": {
            "Data": [
              83,
            ],
            "Units": "degrees",
            "Type": "Wind direction (coming from)"
          }
        },
      } as WeatherForecast
      const actual = service.getWindDataWeatherForecast(input)
      const expected: any = {
        "generalInformation": {
          "timeStamp": "Invalid date",
          "provider": "DTN"
        },
        "weatherForecastWind": [
          {
            "dateTime": {
              "units": "DateTime",
              "type": "Forecast time",
              "dataType": "DATETIME",
              "val": "12-Jan-2022 05:00:00",
              "index": 0
            },
            "dateNum": {
              "units": "DateNum",
              "type": "Forecast time",
              "dataType": "DATENUM",
              "val": 738533.2083333334,
              "index": 0
            },
            "speed": {
              "units": "m/s",
              "type": "Wind speed 10m",
              "dataType": "SPEED",
              "val": 3.3,
              "index": 0
            },
            "gust": {
              "units": "m/s",
              "type": "Wind gust 10m",
              "dataType": "GUST",
              "val": 4.3,
              "index": 0
            },
            "directions": {
              "units": "degrees",
              "type": "Wind direction (coming from)",
              "dataType": "DIRECTIONS",
              "val": 83,
              "index": 0
            }
          }
        ]
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('getCeil', () => {
    it('should get the highest value and round to top', () => {
      const input = [
        {
          "Wind": {
            "DateTime": {
              "Data": [
                "12-Jan-2022 05:00:00",
              ],
              "Units": "DateTime",
              "Type": "Forecast time"
            },
            "Speed": {
              "Data": [
                3.3,
                3, 6,
                61.3
              ],
              "Units": "m/s",
              "Type": "Wind speed 10m"
            },
          },
        }
      ] as WeatherForecast[]
      const actual = service.getCeil(input, 'speed')
      const expected = 62
      expect(actual).toEqual(expected)
    })
  })

  describe('getDataSet', () => {
    it('should create a data set of dateTime, dateNum, speed, gust and directions', () => {
      const input = [
        [
          {
            "units": "DateTime",
            "type": "Forecast time",
            "dataType": "DATETIME",
            "val": "12-Jan-2022 05:00:00",
            "index": 0
          },
          {
            "units": "DateNum",
            "type": "Forecast time",
            "dataType": "DATENUM",
            "val": 738533.2083333334,
            "index": 0
          },
          {
            "units": "m/s",
            "type": "Wind speed 10m",
            "dataType": "SPEED",
            "val": 3.3,
            "index": 0
          },
          {
            "units": "m/s",
            "type": "Wind gust 10m",
            "dataType": "GUST",
            "val": 4.3,
            "index": 0
          },
          {
            "units": "degrees",
            "type": "Wind direction (coming from)",
            "dataType": "DIRECTIONS",
            "val": 83,
            "index": 0
          }
        ]
      ]
      const actual = service.getDataSet(input)
      const expected = [
        {
          "dateTime": {
            "units": "DateTime",
            "type": "Forecast time",
            "dataType": "DATETIME",
            "val": "12-Jan-2022 05:00:00",
            "index": 0
          },
          "dateNum": {
            "units": "DateNum",
            "type": "Forecast time",
            "dataType": "DATENUM",
            "val": 738533.2083333334,
            "index": 0
          },
          "speed": {
            "units": "m/s",
            "type": "Wind speed 10m",
            "dataType": "SPEED",
            "val": 3.3,
            "index": 0
          },
          "gust": {
            "units": "m/s",
            "type": "Wind gust 10m",
            "dataType": "GUST",
            "val": 4.3,
            "index": 0
          },
          "directions": {
            "units": "degrees",
            "type": "Wind direction (coming from)",
            "dataType": "DIRECTIONS",
            "val": 83,
            "index": 0
          }
        }
      ]
      expect(actual).toEqual(expected)
    })
  })
  describe('getTimeStamp', () => {
    it('should format the time to DD MM yyyy, HH:mm', () => {
      const input: any = {
        "RefDateNum": {
          "Data": 738533.2506944444,
          "Units": [],
          "Type": "Wave"
        },
      }
      dateTimeServiceMock.matlabDatenumToDate.and.returnValue(new Date(1, 1, 1))
      const actual = service.getTimeStamp(input)
      const expected = '01 02 1901, 00:00'
      expect(actual).toEqual(expected)
    })
  })
  describe('getYaxisRange', () => {
    it('should retrieve all numbers for the given y axis value ', () => {
      const input = [
        {
          "Wind": {
            "DateTime": {
              "Data": [
                "12-Jan-2022 05:00:00",
              ],
              "Units": "DateTime",
              "Type": "Forecast time"
            },
            "Speed": {
              "Data": [
                3.3,
                3, 6,
                61
              ],
              "Units": "m/s",
              "Type": "Wind speed 10m"
            },
          },
        }
      ] as WeatherForecast[]
      const actual = service.getYaxisRange(input, 'speed')
      const expected: any = [
        3.3,
        3, 6,
        61
      ]

      expect(actual).toEqual(expected)
    })
  })
  describe('createNewDataObjectWithIndex', () => {
    it('should add Data as value and add an index', () => {
      const input = {
        "Data": [
          738533.2083333334
        ],
        "Units": "DateNum",
        "Type": "Forecast time",
        "dataType": "DATENUM"
      }
      const actual = service.createNewDataObjectWithIndex(input)
      const expected: any = [
        {
          "units": "DateNum",
          "type": "Forecast time",
          "dataType": "DATENUM",
          "val": 738533.2083333334,
          "index": 0
        }
      ]
      expect(actual).toEqual(expected)
    })
  })
  describe('setPlotLayout', () => {
    it('should create the data for the plotly graph', () => {
      const waveHeightType = "Wind speed 10m"
      const waveHeightUnit = "m/s"
      const plotRange = [0, 3]
      const actual = service.setPlotLayout(plotRange, waveHeightType, waveHeightUnit)
      const expected: any = {
        "title": "Wind speed 10m",
        "width": 800,
        "height": 450,
        "yaxis": {
          "range": [
            0,
            3
          ],
          "title": "m/s",
          "fixedrange": true
        },
        "xaxis": {
          "automargin": true,
          "type": "date"
        },
        "legend": {
          "x": 1,
          "y": 1,
          "xanchor": "right"
        },
        "margin": {
          "t": 40,
          "b": 0,
          "l": 60,
          "r": 40
        }
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('factorWindInformation', () => {
    it('should add the key as a dataType', () => {
      const input = {
        "Wind": {
          "DateTime": {
            "Data": [
              "12-Jan-2022 05:00:00",
            ],
            "Units": "DateTime",
            "Type": "Forecast time"
          },
          "DateNum": {
            "Data": [
              738533.2083333334,
            ],
            "Units": "DateNum",
            "Type": "Forecast time"
          }
        }
      } as WeatherForecast

      const actual = service.factorWindInformation(input)
      const expected: any = [
        {
          "Data": [
            "12-Jan-2022 05:00:00"
          ],
          "Units": "DateTime",
          "Type": "Forecast time",
          "dataType": "DATETIME"
        },
        {
          "Data": [
            738533.2083333334
          ],
          "Units": "DateNum",
          "Type": "Forecast time",
          "dataType": "DATENUM"
        }
      ]

      expect(actual).toEqual(expected)
    })
  })
  describe('createPlottyData', () => {
    it('should create the data for the plot', () => {
      const input = {
        "generalInformation": {
          "timeStamp": '01-02-2021',
          "provider": "DTN"
        },
        "weatherForecastWind": [
          {
            "dateTime": {
              "units": "DateTime",
              "type": "Forecast time",
              "dataType": "DATETIME",
              "val": "12-Jan-2022 05:00:00",
              "index": 0
            },
            "speed": {
              "units": "m/s",
              "type": "Wind speed 10m",
              "dataType": "SPEED",
              "val": 3.3,
              "index": 0
            },
            "directions": {
              "units": "degrees",
              "type": "Wind direction (coming from)",
              "dataType": "DIRECTIONS",
              "val": 83,
              "index": 0
            }
          }
        ]
      } as WeatherForecastWindGraphMeta
      const actual = service.createPlottyData(input, 'speed')
      const expected: any = {
        "meta": {
          "generalInformation": {
            "timeStamp": "01-02-2021",
            "provider": "DTN"
          },
          "weatherForecastWind": [
            {
              "dateTime": {
                "units": "DateTime",
                "type": "Forecast time",
                "dataType": "DATETIME",
                "val": "12-Jan-2022 05:00:00",
                "index": 0
              },
              "speed": {
                "units": "m/s",
                "type": "Wind speed 10m",
                "dataType": "SPEED",
                "val": 3.3,
                "index": 0
              },
              "directions": {
                "units": "degrees",
                "type": "Wind direction (coming from)",
                "dataType": "DIRECTIONS",
                "val": 83,
                "index": 0
              }
            }
          ]
        },
        "x": [
          new Date("2022-01-12T04:00:00.000Z")
        ],
        "y": [
          3.3
        ],
        "hovertext": [
          "3.3 m/s, 83 degrees"
        ],
        "type": "scatter",
        "connectgaps": false,
        "mode": "lines",
        "hoverinfo": "text",
        "name": "DTN, 01-02-2021"
      }
      expect(actual).toEqual(expected)
    })

  })
 describe('getHoverTextData', () => {
    it('should create an array of strings including Units and value', () => {
      const input =  [
        {
          "speed": {
            "units": "m/s",
            "type": "Wind speed 10m",
            "dataType": "SPEED",
            "val": 3.3,
            "index": 0
          },
          "directions": {
            "units": "degrees",
            "type": "Wind direction (coming from)",
            "dataType": "DIRECTIONS",
            "val": 83,
            "index": 0
          }
        }
      ] as WeatherForecastWind[]
      const actual = service.getHoverTextData(input)
      const expected = ['3.3 m/s, 83 degrees']

      expect(actual).toEqual(expected)
    })
   })
});



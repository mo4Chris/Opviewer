import { Wave, WeatherForecast } from '../weather-forecast.types';
import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph.service';
import { WeatherForecastWaveGraphMeta } from './weather-forecast-wave-height-graph.types';

describe('WeatherForecastWaveHeightGraphService', () => {
  let service: WeatherForecastWaveHeightGraphService;
  let dateTimeServiceMock;
  beforeEach(() => {
    dateTimeServiceMock = jasmine.createSpyObj('DatetimeService', ['matlabDatenumToDate'])
    service = new WeatherForecastWaveHeightGraphService(dateTimeServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlotData', () => {
    it('should factor plotData for graph', () => {
      const input = [
        {
          General: {
            "Forecaster": {
              "Data": "DTN",
              "Units": [],
              "Type": "Forecasting company"
            },
            "RefDateNum": {
              "Data": 738535.2506944444,
              "Units": [],
              "Type": "Wave"
            }
          },
          Wave: {
            "Header": {
              "Data": "DTN Manta forecast",
              "Units": [],
              "Type": ""
            },
            "DateTime": {
              "Data": [
                "14-Jan-2022 05:00:00",
              ],
              "Units": "DateTime",
              "Type": "Forecast time"
            },
            "DateNum": {
              "Data": [
                738535.2083333334,
              ],
              "Units": "DateNum",
              "Type": "Forecast time"
            },
            "Frequencies": {
              "Data": [
                0.21676989309769573,
              ],
              "Units": "rad/s",
              "Type": "Wave frequency"
            },
            "Directions": {
              "Data": [
                0,
              ],
              "Units": "degrees",
              "Type": "Wave direction - coming from (S:0, E:90, N:180)"
            },
            "Density": {
              "Data": [
                [
                  [
                    0,
                  ],
                ]
              ],
              "Units": "m^2/(rad/s)/rad",
              "Type": "Spectral density"
            },
            "Hs": {
              "Data": [
                0.8757817120751572,
              ],
              "Units": "m",
              "Type": "Significant wave height"
            },
            "Hmax": {
              "Data": [
                1.7371186778163297,
              ],
              "Units": "m",
              "Type": "Maximum wave height"
            },
            "Tz": {
              "Data": [
                4.131769272163066,
              ],
              "Units": "s",
              "Type": "Zero crossing period"
            },
          }
        }]
      const actual = service.getPlotData(input, 'tz')
      const expected: any = {
        "plotLayout": {
          "title": "Zero crossing period",
          "width": 800,
          "height": 450,
          "yaxis": {
            "range": [
              0,
              5
            ],
            "title": "s",
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
                "timeStamp": "Invalid date",
                "provider": "DTN"
              },
              "waveWeatherForecast": [
                {
                  "frequencies": {
                    "Data": [
                      0.21676989309769573
                    ],
                    "Units": "rad/s",
                    "Type": "Wave frequency",
                    "dataType": "FREQUENCIES"
                  },
                  "directions": {
                    "Data": [
                      0
                    ],
                    "Units": "degrees",
                    "Type": "Wave direction - coming from (S:0, E:90, N:180)",
                    "dataType": "DIRECTIONS"
                  },
                  "dateTime": {
                    "type": "Forecast time",
                    "units": "DateTime",
                    "dataType": "DATETIME",
                    "val": "14-Jan-2022 05:00:00",
                    "index": 0
                  },
                  "dateNum": {
                    "type": "Forecast time",
                    "units": "DateNum",
                    "dataType": "DATENUM",
                    "val": 738535.2083333334,
                    "index": 0
                  },
                  "hs": {
                    "type": "Significant wave height",
                    "units": "m",
                    "dataType": "HS",
                    "val": "0.88",
                    "index": 0
                  },
                  "hMax": {
                    "type": "Maximum wave height",
                    "units": "m",
                    "dataType": "HMAX",
                    "val": "1.74",
                    "index": 0
                  },
                  "tz": {
                    "type": "Zero crossing period",
                    "units": "s",
                    "dataType": "TZ",
                    "val": "4.13",
                    "index": 0
                  }
                }
              ]
            },
            "x": [
              new Date("2022-01-14T04:00:00.000Z")
            ],
            "y": [
              "4.13"
            ],
            "hovertext": [
              "4.13 s"
            ],
            "type": "scatter",
            "connectgaps": false,
            "mode": "lines",
            "hoverinfo": "text",
            "name": "DTN, Invalid date"
          }
        ]
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('getWaveDataWeatherForecast', () => {
    it('should get wave data for weatherForecast', () => {
      const input =
        {
          General: {
            "Forecaster": {
              "Data": "DTN",
              "Units": [],
              "Type": "Forecasting company"
            },
            "RefDateNum": {
              "Data": 738535.2506944444,
              "Units": [],
              "Type": "Wave"
            }
          },
          Wave: {
            "Header": {
              "Data": "DTN Manta forecast",
              "Units": [],
              "Type": ""
            },
            "DateTime": {
              "Data": [
                "14-Jan-2022 05:00:00",
              ],
              "Units": "DateTime",
              "Type": "Forecast time"
            },
            "DateNum": {
              "Data": [
                738535.2083333334,
              ],
              "Units": "DateNum",
              "Type": "Forecast time"
            },
            "Frequencies": {
              "Data": [
                0.21676989309769573,
              ],
              "Units": "rad/s",
              "Type": "Wave frequency"
            },
            "Directions": {
              "Data": [
                0,
              ],
              "Units": "degrees",
              "Type": "Wave direction - coming from (S:0, E:90, N:180)"
            },
            "Density": {
              "Data": [
                [
                  [
                    0,
                  ],
                ]
              ],
              "Units": "m^2/(rad/s)/rad",
              "Type": "Spectral density"
            },
            "Hs": {
              "Data": [
                0.8757817120751572,
              ],
              "Units": "m",
              "Type": "Significant wave height"
            },
            "Hmax": {
              "Data": [
                1.7371186778163297,
              ],
              "Units": "m",
              "Type": "Maximum wave height"
            },
            "Tz": {
              "Data": [
                4.131769272163066,
              ],
              "Units": "s",
              "Type": "Zero crossing period"
            },
          }
        } as WeatherForecast

      const actual = service.getWaveDataWeatherForecast(input)

      const expected = {
        "generalInformation": {
          "timeStamp": "Invalid date",
          "provider": "DTN"
        },
        "waveWeatherForecast": [
          {
            "frequencies": {
              "Data": [
                0.21676989309769573
              ],
              "Units": "rad/s",
              "Type": "Wave frequency",
              "dataType": "FREQUENCIES"
            },
            "directions": {
              "Data": [
                0
              ],
              "Units": "degrees",
              "Type": "Wave direction - coming from (S:0, E:90, N:180)",
              "dataType": "DIRECTIONS"
            },
            "dateTime": {
              "type": "Forecast time",
              "units": "DateTime",
              "dataType": "DATETIME",
              "val": "14-Jan-2022 05:00:00",
              "index": 0
            },
            "dateNum": {
              "type": "Forecast time",
              "units": "DateNum",
              "dataType": "DATENUM",
              "val": 738535.2083333334,
              "index": 0
            },
            "hs": {
              "type": "Significant wave height",
              "units": "m",
              "dataType": "HS",
              "val": "0.88",
              "index": 0
            },
            "hMax": {
              "type": "Maximum wave height",
              "units": "m",
              "dataType": "HMAX",
              "val": "1.74",
              "index": 0
            },
            "tz": {
              "type": "Zero crossing period",
              "units": "s",
              "dataType": "TZ",
              "val": "4.13",
              "index": 0
            }
          }
        ]
      }
      expect(actual).toEqual(expected)
    })

  })

  describe('getNewDataObject', () => {
    it('should add Data as value and add an index', () => {
      const input = [{
        "Data": [
          738533.2083333334
        ],
        "Units": "DateNum",
        "Type": "Forecast time",
        "dataType": "DATENUM"
      }]
      const actual = service.getNewDataObject(input)

      const expected: any = [
        [
          {
            "type": "Forecast time",
            "units": "DateNum",
            "dataType": "DATENUM",
            "val": 738533.2083333334,
            "index": 0
          }
        ]
      ]
      expect(actual).toEqual(expected)
    })
  })

  describe('createPlottyData', () => {
    it('should create the plotted data', () => {
      const input: WeatherForecastWaveGraphMeta = {
        "generalInformation": {
          "timeStamp": "14 01 2022, 13:02",
          "provider": "DTN"
        },
        "waveWeatherForecast": [
          {
            "frequencies": {
              "Data": [
                0.21676989309769573,
              ],
              "Units": "rad/s",
              "Type": "Wave frequency",
              "dataType": "FREQUENCIES"
            },
            "directions": {
              "Data": [
                0,
              ],
              "Units": "degrees",
              "Type": "Wave direction - coming from (S:0, E:90, N:180)",
              "dataType": "DIRECTIONS"
            },
            "dateTime": {
              "type": "Forecast time",
              "units": "DateTime",
              "dataType": "DATETIME",
              "val": "19-Jan-2022 11:00:00",
              "index": 120
            },
            "dateNum": {
              "type": "Forecast time",
              "units": "DateNum",
              "dataType": "DATENUM",
              "val": 738540.4583333334,
              "index": 120
            },
            "hs": {
              "type": "Significant wave height",
              "units": "m",
              "dataType": "HS",
              "val": "0.96",
              "index": 120
            },
            "hMax": {
              "type": "Maximum wave height",
              "units": "m",
              "dataType": "HMAX",
              "val": "1.79",
              "index": 120
            },
            "tz": {
              "type": "Zero crossing period",
              "units": "s",
              "dataType": "TZ",
              "val": "10.43",
              "index": 120
            }
          }
        ]
      }
      const actual = service.createPlottyData(input, 'tz')
      const expected: any = {
        "meta": {
          "generalInformation": {
            "timeStamp": "14 01 2022, 13:02",
            "provider": "DTN"
          },
          "waveWeatherForecast": [
            {
              "frequencies": {
                "Data": [
                  0.21676989309769573
                ],
                "Units": "rad/s",
                "Type": "Wave frequency",
                "dataType": "FREQUENCIES"
              },
              "directions": {
                "Data": [
                  0
                ],
                "Units": "degrees",
                "Type": "Wave direction - coming from (S:0, E:90, N:180)",
                "dataType": "DIRECTIONS"
              },
              "dateTime": {
                "type": "Forecast time",
                "units": "DateTime",
                "dataType": "DATETIME",
                "val": "19-Jan-2022 11:00:00",
                "index": 120
              },
              "dateNum": {
                "type": "Forecast time",
                "units": "DateNum",
                "dataType": "DATENUM",
                "val": 738540.4583333334,
                "index": 120
              },
              "hs": {
                "type": "Significant wave height",
                "units": "m",
                "dataType": "HS",
                "val": "0.96",
                "index": 120
              },
              "hMax": {
                "type": "Maximum wave height",
                "units": "m",
                "dataType": "HMAX",
                "val": "1.79",
                "index": 120
              },
              "tz": {
                "type": "Zero crossing period",
                "units": "s",
                "dataType": "TZ",
                "val": "10.43",
                "index": 120
              }
            }
          ]
        },
        "x": [
          new Date("2022-01-19T10:00:00.000Z")
        ],
        "y": [
          "10.43"
        ],
        "hovertext": [
          "10.43 s"
        ],
        "type": "scatter",
        "connectgaps": false,
        "mode": "lines",
        "hoverinfo": "text",
        "name": "DTN, 14 01 2022, 13:02"
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('getHoverTextData', () => {
    it('should create an array of strings including Units and value', () => {
      const input = [
        {
          "hs": {
            "units": "unit",
            "type": "val",
            "dataType": "HS",
            "val": 3.3,
            "index": 0
          }
        }
      ]
      const actual = service.getHoverTextData(input, 'hs')
      const expected = ['3.3 unit']

      expect(actual).toEqual(expected)
    })
  })

  describe('getCeil', () => {
    it('should get the highest value and round to top', () => {
      const input = [
        {
          "Wave": {
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
          } as unknown as Wave,
        }
      ] as WeatherForecast[]
      const actual = service.getCeil(input, 'speed')
      const expected = 62
      expect(actual).toEqual(expected)
    })
  })

  describe('getYaxisRange', () => {
    it('should retrieve all numbers for the given y axis value ', () => {
      const input = [
        {
          "Wave": {
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
          } as unknown as Wave,
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

  describe('getDataSet', () => {
    it('should return all provided data in one object', () => {
      const input = [
        [
          {
            "type": "Forecast time",
            "units": "DateTime",
            "dataType": "DATETIME",
            "val": "14-Jan-2022 05:00:00",
            "index": 0
          },
          {
            "type": "Forecast time",
            "units": "DateNum",
            "dataType": "DATENUM",
            "val": 738535.2083333334,
            "index": 0
          },
          {
            "type": "Spectral density",
            "units": "m^2/(rad/s)/rad",
            "dataType": "DENSITY",
            "val": [
              [
                0
              ]
            ],
            "index": 0
          },
          {
            "type": "Significant wave height",
            "units": "m",
            "dataType": "HS",
            "val": 0.8757817120751572,
            "index": 0
          },
          {
            "type": "Maximum wave height",
            "units": "m",
            "dataType": "HMAX",
            "val": 1.7371186778163297,
            "index": 0
          },
          {
            "type": "Zero crossing period",
            "units": "s",
            "dataType": "TZ",
            "val": 4.131769272163066,
            "index": 0
          }
        ]
      ]
      const frequencies = {
        "Data": [
          0.21676989309769573,
        ],
        "Units": "rad/s",
        "Type": "Wave frequency"
      }
      const directions = {
        "Data": [
          0,
        ],
        "Units": "degrees",
        "Type": "Wave direction - coming from (S:0, E:90, N:180)"
      }
      const actual = service.getDataSet(input, frequencies, directions)

      const expected = [
        {
          "frequencies": {
            "Data": [
              0.21676989309769573
            ],
            "Units": "rad/s",
            "Type": "Wave frequency"
          },
          "directions": {
            "Data": [
              0
            ],
            "Units": "degrees",
            "Type": "Wave direction - coming from (S:0, E:90, N:180)"
          },
          "dateTime": {
            "type": "Forecast time",
            "units": "DateTime",
            "dataType": "DATETIME",
            "val": "14-Jan-2022 05:00:00",
            "index": 0
          },
          "dateNum": {
            "type": "Forecast time",
            "units": "DateNum",
            "dataType": "DATENUM",
            "val": 738535.2083333334,
            "index": 0
          },
          "hs": {
            "type": "Significant wave height",
            "units": "m",
            "dataType": "HS",
            "val": "0.88",
            "index": 0
          },
          "hMax": {
            "type": "Maximum wave height",
            "units": "m",
            "dataType": "HMAX",
            "val": "1.74",
            "index": 0
          },
          "tz": {
            "type": "Zero crossing period",
            "units": "s",
            "dataType": "TZ",
            "val": "4.13",
            "index": 0
          }
        }
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

  describe('factorWaveInformation', () => {
    it('should add the key as a dataType', () => {
      const input = {
        "Wave": {
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

      const actual = service.factorWaveInformation(input)
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
});

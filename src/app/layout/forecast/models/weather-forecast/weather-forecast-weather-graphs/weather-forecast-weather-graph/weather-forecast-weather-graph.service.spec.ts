import { DayReport } from '../weather-forecast.types';

import { WeatherForecastWeatherGraphService } from './weather-forecast-weather-graph.service';

describe('WeatherForecastWeatherGraphService', () => {
  let service: WeatherForecastWeatherGraphService;

  beforeEach(() => {
    service = new WeatherForecastWeatherGraphService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createGraphInformation', () => {
    it('should create', () => {
      const dayReport: DayReport = {
        'daySummary': 'Partly cloudy throughout the day.',
        'date': 'Wednesday, 18 August',
        'day': 'Wed',
        'dateIcon': 'partly-cloudy-day',
        'timeOfSunrise': '07:13',
        'timeOfSunset': '21:18',
        'temperatureLow': {
          'val': 16.51,
          'unit': 'degrees Celcius'
        },
        'temperatureHigh': {
          'val': 19.42,
          'unit': 'degrees Celcius'
        },
        'precipitationProbability': {
          'val': 0.03,
          'unit': []
        },
        'precipitationIntensity': {
          'val': 0.001,
          'unit': 'mm/hour'
        },
        'visibility': 16.093,
        'windSpeed': {
          'val': 5.12,
          'unit': 'm/s'
        },
        'windGust': {
          'val': 7.57,
          'unit': 'm/s'
        },
        'windDirection': {
          'val': 307,
          'unit': 'degrees'
        },
        'dateGraphInformation': [
          {
            'day': 'Wed',
            'visibility': {
              'val': 16.093,
              'unit': 'kilometers'
            },
            'temperature': {
              'val': 17.85,
              'unit': 'degrees Celcius'
            },
            'dateNum': '738386',
            'hour': '23:00',
            'date': new Date('2021-08-18T21:00:00.000Z'),
            'formattedDate': 'Wednesday, 18 August',
            'icon': 'partly-cloudy-day',
            'pressure': {
              'val': 1019.1,
              'unit': 'hectoPascal'
            },
            'humidity': {
              'val': 0.79,
              'unit': '-'
            }
          }
        ]
      };
      const actual = service.createGraphInformation(dayReport, 'temperature');
      const expected: any = {
        'plotData': [
          {
            'x': [
              new Date('2021-08-18T21:00:00.000Z')
            ],
            'y': [
              17.85
            ],
            'type': 'bar',
            'name': 'degrees Celcius',
            'connectgaps': false,
            'marker': {
              'color': '#007bff'
            }
          }
        ],
        'plotLayout': {
          'title': 'Wednesday, 18 August: temperature',
          width: 800,
          height: 450,
          'yaxis': {
            'range': [
              0,
              18
            ],
            'title': 'degrees Celcius',
            'fixedrange': true
          },
          'xaxis': {
            'automargin': true,
            'type': 'date',
            'title': 'hours'
          },
          'margin': {
            't': 40,
            'b': 0,
            'l': 60,
            'r': 40
          }
        }
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('getRangeForType', () => {
    const array = [-1, 2, 4, 6, 8];

    it('should return a tuple (temperature)', () => {
      const actual = service.getRangeForType('temperature', array);
      expect(actual.length).toBe(2);
    });

    it('should return a tuple (humidity)', () => {
      const actual = service.getRangeForType('humidity', array);
      expect(actual.length).toBe(2);
    });

    it('should return a tuple (visibility)', () => {
      const actual = service.getRangeForType('visibility', array);
      expect(actual.length).toBe(2);
    });

    it('should return a tuple (pressure)', () => {
      const actual = service.getRangeForType('pressure', array);
      expect(actual.length).toBe(2);
    });

    it('should return a tuple (other)', () => {
      const actual = service.getRangeForType('cats_and_dogs', array);
      expect(actual.length).toBe(2);
    });

    it('should clamp the values when type is pressure', () => {
      const actual = service.getRangeForType('pressure', array);
      expect(actual).toEqual([-1, 8]);
    });

    it('should clamp the values with an offset of 1 when type is visibility', () => {
      const actual = service.getRangeForType('visibility', array);
      expect(actual).toEqual([-2, 9]);
    });

    it('should use rangeByLowest for any other type', () => {
      const actual = service.getRangeForType('cats_and_dogs', array);
      expect(actual).toEqual([-1, 8]);
    });
  });

  describe('rangeByLowest', () => {
    it('should return a tuple with an lower bound that\'s equal or lower than 0', () => {
      const array = [-4, -2, 0, 8, 16];
      const actual = service.rangeByLowest(array);
      expect(actual).toEqual([-4, 16]);
    });

    it('should always return a lower bound of 0 even when the lowest value is higher', () => {
      const array = [8, 9, 10, 11, 12];
      const actual = service.rangeByLowest(array);
      expect(actual).toEqual([0, 12]);
    });

    it('should keep the lower bound at 0 when this is the lowest value', () => {
      const array = [0, 8, 12, 16, 18];
      const actual = service.rangeByLowest(array);
      expect(actual).toEqual([0, 18]);
    });

    it('should not fail if the input array has a length of 1', () => {
      const array = [5];
      const actual = service.rangeByLowest(array);
      expect(actual).toEqual([0, 5]);
    });

    it('should not fail if the input array has a length of 1, with a negative value', () => {
      const array = [-5];
      const actual = service.rangeByLowest(array);
      expect(actual).toEqual([-5, -5]);
    });
  });

  describe('rangeWithOffset', () => {
    it('should return a tuple with the lower and upper bound set to the lowest and highest value of the array when no offset is given', () => {
      const array = [-4, -2, 0, 8, 16];
      const actual = service.rangeWithOffset(array);
      expect(actual).toEqual([-4, 16]);
    });

    it('should apply the correct offset to the upper and lower bounds', () => {
      const array = [-4, -2, 0, 8, 16];
      const actual = service.rangeWithOffset(array, 8);
      expect(actual).toEqual([-12, 24]);
    });

    it('should apply the correct offset, even when the offset is negative', () => {
      const array = [-4, -2, 0, 8, 16];
      const actual = service.rangeWithOffset(array, -8);
      expect(actual).toEqual([4, 8]);
    });

    it('should not fail if the input array has a length of 1', () => {
      const array = [5];
      const actual = service.rangeWithOffset(array, 2);
      expect(actual).toEqual([3, 7]);
    });
  });

  describe('createPlotlyData', () => {
    it('should create', () => {
      const input = {
        'dateArray': [
          '2021-08-18T21:00:00.000Z'
        ],
        'temperatureArray': [
          17.85
        ],
        'title': 'degrees Celcius'
      };

      const actual = service.createPlotlyData(input);
      const expected: any = [
        {
          'x': [
            '2021-08-18T21:00:00.000Z'
          ],
          'y': [
            17.85
          ],
          'type': 'bar',
          'name': 'degrees Celcius',
          'connectgaps': false,
          'marker': {
            'color': '#007bff'
          }
        }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('setPlotLayout', () => {
    it('should create a new plot layout', () => {
      const range = [0, 18];
      const graphTitle = 'lalal';
      const titleY = 'degrees';

      const actual = service.setPlotLayout(range, graphTitle, titleY);
      const expected: any = {
        title: graphTitle,
        width: 800,
        height: 450,
        yaxis: {
          range: range,
          title: titleY,
          fixedrange: true,
        },
        xaxis: {
          automargin: true,
          type: 'date',
          title: 'hours'
        },
        margin: {
          t: 40,
          b: 0,
          l: 60,
          r: 40
        }
      };
      expect(actual).toEqual(expected);
    });
  });
});

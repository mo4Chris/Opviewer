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
                "daySummary": "Partly cloudy throughout the day.",
                "date": "Wednesday, 18 August",
                "day": "Wed",
                "dateIcon": "partly-cloudy-day",
                "timeOfSunrise": "07:13",
                "timeOfSunset": "21:18",
                "temperatureLow": {
                    "val": 16.51,
                    "unit": "degrees Celcius"
                },
                "temperatureHigh": {
                    "val": 19.42,
                    "unit": "degrees Celcius"
                },
                "precipitationProbability": {
                    "val": 0.03,
                    "unit": []
                },
                "precipitationIntensity": {
                    "val": 0.001,
                    "unit": "mm/hour"
                },
                "visibility": 16.093,
                "windSpeed": {
                    "val": 5.12,
                    "unit": "m/s"
                },
                "windGust": {
                    "val": 7.57,
                    "unit": "m/s"
                },
                "windDirection": {
                    "val": 307,
                    "unit": "degrees"
                },
                "dateGraphInformation": [
                    {
                        "day": "Wed",
                        "visibility": {
                            "val": 16.093,
                            "unit": "kilometers"
                        },
                        "temperature": {
                            "val": 17.85,
                            "unit": "degrees Celcius"
                        },
                        "dateNum": "738386",
                        "hour": "23:00",
                        "date": new Date("2021-08-18T21:00:00.000Z"),
                        "formattedDate": "Wednesday, 18 August",
                        "icon": "partly-cloudy-day",
                        "pressure": {
                            "val": 1019.1,
                            "unit": "hectoPascal"
                        },
                        "humidity": {
                            "val": 0.79,
                            "unit": "-"
                        }
                    }
                ]
            }
            const actual = service.createGraphInformation(dayReport, 'temperature')
            const expected: any = {
                "plotData": [
                    {
                        "x": [
                            new Date("2021-08-18T21:00:00.000Z")
                        ],
                        "y": [
                            17.85
                        ],
                        "type": "bar",
                        "name": "degrees Celcius",
                        "connectgaps": false,
                        "marker": {
                            "color": "#007bff"
                        }
                    }
                ],
                "plotLayout": {
                    "title": "Wednesday, 18 August: temperature",
                    "yaxis": {
                        "range": [
                            0,
                            18
                        ],
                        "title": "degrees Celcius",
                        "fixedrange": true
                    },
                    "xaxis": {
                        "automargin": true,
                        "type": "date",
                        "title": "hours"
                    },
                    "margin": {
                        "t": 40,
                        "b": 0,
                        "l": 60,
                        "r": 40
                    }
                }
            }
            expect(actual).toEqual(expected);
        })
    })

    describe('createPlottyData', () => {
        it('should create', () => {
            const input = {
                "dateArray": [
                    "2021-08-18T21:00:00.000Z"
                ],
                "temperatureArray": [
                    17.85
                ],
                "title": "degrees Celcius"
            }

            const actual = service.createPlottyData(input)
            const expected: any = [
                {
                    "x": [
                        "2021-08-18T21:00:00.000Z"
                    ],
                    "y": [
                        17.85
                    ],
                    "type": "bar",
                    "name": "degrees Celcius",
                    "connectgaps": false,
                    "marker": {
                        "color": "#007bff"
                    }
                }
            ]
            expect(actual).toEqual(expected);
        })
    })

    describe("setPlotLayout", () => {
        it("should create a new plot layout", () => {
            const range = [0, 18]
            const graphTitle = 'lalal'
            const titleY = 'degrees'

            const actual = service.setPlotLayout(range, graphTitle, titleY)
            const expected: any = {
                title: graphTitle,
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
            }
            expect(actual).toEqual(expected)
        })
    })
});

// import { PrecipitationProbability, WeatherForecast , Wave} from '../weather-forecast.types';
// import { WeatherForecastWaveHeightGraphService } from './weather-forecast-wave-height-graph.service';

// describe('WeatherForecastWaveHeightGraphService', () => {
//   let service: WeatherForecastWaveHeightGraphService;

//   beforeEach(() => {
//     service = new WeatherForecastWaveHeightGraphService();
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   describe('Weather', () => {
//     describe('createPlotDataSet',()=>{
//       it('should add key as captialized dataType', ()=>{
//         const wave = {
//           'Wave': {
//             header: {
//               lala: '123'
//             },
//             something: {
//               lala: '123'
//             }
//           }
//         } as unknown as WeatherForecast;
  
//         const actual = service.factorWaveInformation(wave);
//         const expected: any = [
//           {lala: '123', dataType: 'HEADER'},
//           {lala: '123', dataType: 'SOMETHING'},
//         ]
//         expect(actual).toEqual(expected);
//       })
//     })

//   })

// });

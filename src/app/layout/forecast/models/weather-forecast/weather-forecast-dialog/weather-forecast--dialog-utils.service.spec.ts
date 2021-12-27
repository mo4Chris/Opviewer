import { WeatherForecastDialogUtilsService } from './weather-forecast-dialog-utils.service';

describe('WeatherForecastDialogUtilsService', () => {
  let service: WeatherForecastDialogUtilsService;

  beforeEach(() => {
    service = new WeatherForecastDialogUtilsService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSelectedIds',()=>{
    it('should retrieve an array of selectedIds',()=>{
      const input = {
        "val1": false,
        "val2": false,
        "val3": true,
        "val4": false,
    }

    const actual = service.getSelectedIds(input);
    const expected = ['val3'];
    expect(actual).toEqual(expected);
    })
    
    it('should return an empty array if no checkboxes are checked',()=>{
      const input = {
        "val1": false,
        "val2": false,
        "val3": false,
        "val4": false,
    }

    const actual = service.getSelectedIds(input);
    const expected = [];
    expect(actual).toEqual(expected);
    })
  })
});

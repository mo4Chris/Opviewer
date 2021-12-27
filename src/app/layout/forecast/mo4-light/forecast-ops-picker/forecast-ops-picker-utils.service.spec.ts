import { ForecastOpsPickerUtilsService } from './forecast-ops-picker-utils.service';

describe('ForecastOpsPickerUtilsService', () => {
  let service: ForecastOpsPickerUtilsService;

  beforeEach(() => {
    service = new ForecastOpsPickerUtilsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shouldShowOperationSettingsOptions',()=>{
    
    it('should return true when selected tab is specified',()=> {
      const selectedTab = 'Workability'
      
      const actual = service.shouldShowOperationSettingsOptions(selectedTab)
      const expected = true;
      
      expect(actual).toEqual(expected);
    })
    
    it('should return false when selected tab is not in specified list',()=> {
      const selectedTab = 'something not listed'
      
      const actual = service.shouldShowOperationSettingsOptions(selectedTab)
      const expected = false;
      
      expect(actual).toEqual(expected);
    })
  })

  describe('shouldShowSlipSettings',()=>{
    
    it('should return true when selected tab is specified',()=> {
      const selectedTab = 'Workability'
      
      const actual = service.shouldShowSlipSettings(selectedTab)
      const expected = true;
      
      expect(actual).toEqual(expected);
    })
    
    it('should return false when selected tab is not in specified list',()=> {
      const selectedTab = 'something not listed'
      
      const actual = service.shouldShowSlipSettings(selectedTab)
      const expected = false;
      
      expect(actual).toEqual(expected);
    })
  })
});

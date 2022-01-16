import { PermissionModel } from '@app/shared/permissions/permission.service';
import { ForecastOpsPickerUtilsService } from './forecast-ops-picker-utils.service';

describe('ForecastOpsPickerUtilsService', () => {
  let service: ForecastOpsPickerUtilsService;

  beforeEach(() => {
    service = new ForecastOpsPickerUtilsService;
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

  describe('shouldDisableAddButton',()=>{
    it('should never disable add button / return false when the licenceType is "PRO" ', () => {
      const permission = { licenceType: 'PRO' } as unknown as PermissionModel
      const amountOfLimits = 5
      const actual = service.shouldDisableAddButton(permission, amountOfLimits)
      const expected = false;

      expect(actual).toEqual(expected);
    })

    it('should disable add button / return true when the lenght of limits is larger than 3', () => {
      const permission = { licenceType: 'LIGHT' } as unknown as PermissionModel
      const amountOfLimits = 3
      const actual = service.shouldDisableAddButton(permission, amountOfLimits)
      const expected = true;

      expect(actual).toEqual(expected);
    })
    
    it('should not disable add button / return false when the lenght of limits is larger than 3', () => {
      const permission = { licenceType: 'LIGHT' } as unknown as PermissionModel
      const amountOfLimits = 2
      const actual = service.shouldDisableAddButton(permission, amountOfLimits)
      const expected = false;

      expect(actual).toEqual(expected);
    })
  })
})

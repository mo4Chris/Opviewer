import { Injectable } from '@angular/core';

export const TAB_LIST = {
  WORKABILITY: 'Workability',
  LIMITER: 'Limiter'
}
@Injectable()
export class ForecastOpsPickerUtilsService {

  shouldShowOperationSettingsOptions(selectedTab: string): boolean {
    const listedTablist = [TAB_LIST.WORKABILITY, TAB_LIST.LIMITER]
    return listedTablist.includes(selectedTab)
  }

  shouldShowSlipSettings(selectedTab: string): boolean {
    return selectedTab === TAB_LIST.WORKABILITY
  }
}
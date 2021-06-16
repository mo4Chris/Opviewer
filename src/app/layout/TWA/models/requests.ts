export interface TwaSaveFleetModel {
  boats: any[],
  client: string,
  windfield: string,
  startDate: { year: null, month: null, day: null },
  stopDate: { year: null, month: null, day: null },
  numContractedVessels: number,
  campaignName: string,
  weatherDayTarget: null,
  weatherDayTargetType: string,
  jsTime: { startDate: number, stopDate: number },
  validFields: any[],
  limitHs: null,
  requestTime: null
}

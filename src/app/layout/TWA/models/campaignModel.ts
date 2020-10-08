

export class CampaignModel {
    campaignName: string;

    fullFleet: string[];
    activeFleet: string[];
    validFields: string[];
    startDate: number;
    stopDate: number;
    windField: string;

    numContractedVessels: number;
    weatherDayTarget: number;
    weatherDayForecast: number[];
    Dates: number[];
    sailMatrix: any[][];
    currentlyActive: any[];
    client: string;
    lastUpdated: number;
}

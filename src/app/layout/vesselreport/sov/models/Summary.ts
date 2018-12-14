export class SummaryModel {
    TotalSailDistance: string;
    HasSailed: boolean;
    
    AvgTimeInWaitingZone: string;
    AvgTimeInExclusionZone: string;
    AvgTimeDocking: string;
    AvgTimeTravelingToPlatforms: string;

    NrOfHelicopterVisits: number;
    AvgTimeHelicopterDocking: string;

    NrOfVesselTransfers: number;
    AvgTimeVesselDocking: string;

    NrOfDaughterCraftLaunches: number;
    AvgTimeDaughterCraftDocking: string;

    maxSignificantWaveHeightdDuringOperations: number;
    maxWindSpeedDuringOperations: number;
}
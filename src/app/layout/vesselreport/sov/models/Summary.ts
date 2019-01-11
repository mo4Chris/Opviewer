export class SummaryModel {
    TotalSailDistance: string;
    HasSailed: boolean;
    
    AvgTimeInWaitingZone: string;
    AvgTimeInExclusionZone: string;
    AvgTimeDocking: string;
    AvgTimeTravelingToPlatforms: string;

    NrOfHelicopterVisits: number;
    AvgTimeHelicopterDocking: number;

    NrOfVesselTransfers: number;
    AvgTimeVesselDocking: number;

    NrOfDaughterCraftLaunches: number;
    AvgTimeDaughterCraftDocking: number;

    maxSignificantWaveHeightdDuringOperations: number;
    maxWindSpeedDuringOperations: number;
}
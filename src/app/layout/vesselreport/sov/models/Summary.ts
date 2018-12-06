export class SummaryModel {
    TotalSailDuration: string;
    TotalSailDistance: string
    
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
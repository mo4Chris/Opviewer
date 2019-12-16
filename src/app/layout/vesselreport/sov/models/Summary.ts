export class SummaryModel {
    TotalSailDistance: string;
    HasSailed: boolean;

    departureFromHarbour: string;
    arrivalAtHarbour: string;

    AvgTimeInWaitingZone: string;
    AvgTimeInExclusionZone: string;
    AvgTimeDocking: string;
    AvgTimeTravelingToPlatforms: string;

    NrOfHelicopterVisits: number;
    AvgTimeHelicopterDocking: number;

    NrOfVesselTransfers: number;
    AvgTimeVesselDocking: string;

    NrOfDaughterCraftLaunches: number;
    AvgTimeDaughterCraftDocking: string;

    maxSignificantWaveHeightdDuringOperations: string;
    maxWindSpeedDuringOperations: string;
}

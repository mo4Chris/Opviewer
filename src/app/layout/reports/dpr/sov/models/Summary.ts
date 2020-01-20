export class SummaryModel {
    TotalSailDistance = 'N/a';
    HasSailed: boolean;

    departureFromHarbour = 'N/a';
    arrivalAtHarbour = 'N/a';

    AvgTimeInWaitingZone = 'N/a';
    AvgTimeInExclusionZone = 'N/a';
    AvgTimeDocking = 'N/a';
    AvgTimeTravelingToPlatforms = 'N/a';

    NrOfHelicopterVisits: number;
    AvgTimeHelicopterDocking: number;

    NrOfVesselTransfers: number;
    AvgTimeVesselDocking = 'N/a';

    NrOfDaughterCraftLaunches: number;
    AvgTimeDaughterCraftDocking = 'N/a';

    maxSignificantWaveHeightdDuringOperations = 'N/a';
    maxWindSpeedDuringOperations = 'N/a';
}

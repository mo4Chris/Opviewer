export class SummaryModel {
    TotalSailDuration: string;

    TimeInWaitingZone: number;
    AvgTimeInWaitingZone: number;

    TimeInExclusionZone: string;
    AvgTimeInExclusionZone: string;

    TimeDocking: number;
    AvgTimeDocking: number;

    TimeTravelingToPlatforms: number;
    AvgTimeTravelingToPlatforms: number;

    DCSailingTime: number;
    AvgDCSailingTime: number;

    TimeOnDeck: number;
    AvgTimeOnDeck: number;

    HsDuringOperations: number;
    AvgHsDuringOperations: string;

    WindSpeedDuringOperations: number;
    AvgWindSpeedDuringOperations: string;

    NrOfHelicopterVisits: number;
    NrOfPlatformsVisited: number;
    NrOfVesselTransfers: number;
    NrOfDaughterCraftLaunches: number;
}
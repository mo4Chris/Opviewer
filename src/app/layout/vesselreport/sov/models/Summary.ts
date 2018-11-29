export class SummaryModel {
    TotalSailDuration: string;

    TimeInWaitingZone: string;
    AvgTimeInWaitingZone: string;

    TimeInExclusionZone: string;
    AvgTimeInExclusionZone: string;

    TimeDocking: string;
    AvgTimeDocking: string;

    TimeTravelingToPlatforms: string;
    AvgTimeTravelingToPlatforms: string;

    DCSailingTime: string;
    AvgDCSailingTime: string;

    TimeOnDeck: string;
    AvgTimeOnDeck: string;

    HsDuringOperations: string;
    AvgHsDuringOperations: string;

    WindSpeedDuringOperations: number;
    AvgWindSpeedDuringOperations: string;

    NrOfHelicopterVisits: number;
    NrOfPlatformsVisited: number;
    NrOfVesselTransfers: number;
    NrOfDaughterCraftLaunches: number;
}
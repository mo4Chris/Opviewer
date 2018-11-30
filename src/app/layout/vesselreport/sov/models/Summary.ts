export class SummaryModel {
    TotalSailDuration: string;
    TotalSailDistance: string
    
    TimeInWaitingZone: string;
    AvgTimeInWaitingZone: string;

    TimeInExclusionZone: string;
    AvgTimeInExclusionZone: string;

    TimeDocking: string;
    AvgTimeDocking: string;

    TimeTravelingToPlatforms: string;
    AvgTimeTravelingToPlatforms: string;

    NrOfHelicopterVisits: number;
    AvgTimeHelicopterDocking: string;

    NrOfVesselTransfers: number;
    AvgTimeVesselDocking: string;

    NrOfDaughterCraftLaunches: number;
    AvgTimeDaughterCraftDocking: string;


    HsDuringOperations: string;
    AvgHsDuringOperations: string;

    WindSpeedDuringOperations: number;
    AvgWindSpeedDuringOperations: string;
}
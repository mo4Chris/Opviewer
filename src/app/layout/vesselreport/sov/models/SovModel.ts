import { SummaryModel } from "./Summary";
import { PlatformTransfer } from "./Transfers/PlatformTransfer";
import { TurbineTransfer } from "./Transfers/TurbineTransfer";
import { Transit } from "./Transfers/Transit";
import { SovType } from "./SovType";
import { Vessel2vesselModel } from "./Transfers/Vessel2vessel";
import { StationaryPeriod } from "./Transfers/StationaryPeriod";
import { SovData } from "./SovData";

export class SovModel {

    sovInfo: SovData;

    sovType: SovType;

    summary: SummaryModel;
    
    platformTransfers: PlatformTransfer[];
    turbineTransfers: TurbineTransfer[];
    transits: Transit[];
    vessel2vessels: Vessel2vesselModel[];
    turbineActivities: Vessel2vesselModel[];

    stationaryPeriods: StationaryPeriod[];
 
    constructor() {
        this.sovInfo = new SovData();
        this.summary = new SummaryModel();

        this.sovType = SovType.Unknown;

        this.transits = [];
        this.vessel2vessels = [];
        this.platformTransfers = [];
        this.turbineTransfers = [];
        this.stationaryPeriods = [];
        this.turbineActivities = [];
    }
}

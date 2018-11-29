import { SummaryModel } from "./Summary";
import { PlatformTransfers } from "./Transfers/platform-transfers";
import { TurbineTransfer } from "./Transfers/turbine-transfer";
import { Transit } from "./Transfers/Transit";
import { SovType } from "./SovType";
import { ConditionDuringOperationModel } from "./ConditionDuringOperation";
import { Vessel2vesselModel } from "./Transfers/Vessel2vessel";

export class SovModel {
    vesselname: String;
    mmsi: Number;

    sovType: SovType;

    summary: SummaryModel;

    conditions: ConditionDuringOperationModel[];
    
    platformTransfers: PlatformTransfers[];
    turbineTransfers: TurbineTransfer[];
    transits: Transit[];
    vessel2vessels: Vessel2vesselModel[];

    constructor() {
        this.summary = new SummaryModel();

        this.sovType = SovType.Unknown;

        this.conditions = [];

        this.transits = [];
        this.vessel2vessels = [];
        this.platformTransfers = [];
        this.turbineTransfers = [];
    }
}

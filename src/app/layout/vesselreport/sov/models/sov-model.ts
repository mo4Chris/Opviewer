import { SummaryModel } from "./Summary";
import { PlatformTransfers } from "./platform-transfers";
import { TurbineTransfer } from "./turbine-transfer";
import { Transit } from "./Transit";
import { SovType } from "./SovType";
import { ConditionDuringOperationModel } from "./ConditionDuringOperation";

export class SovModel {
    vesselname: String;
    mmsi: Number;

    sovType: SovType;

    summary: SummaryModel;

    conditions: ConditionDuringOperationModel[];
    
    platformTransfers: PlatformTransfers[];
    turbineTransfers: TurbineTransfer[];
    transits: Transit[];

    constructor() {
        this.summary = new SummaryModel();

        this.sovType = SovType.Unknown;

        this.conditions = [];

        this.transits = [];
        this.platformTransfers = [];
        this.turbineTransfers = [];
    }
}

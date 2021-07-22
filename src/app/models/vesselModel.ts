

export class VesselModel {
    // Database return array of this template
    Site: string;
    client: string[];
    Operator: MongoString;
    vesselname: string;
    nicename: string;
    mmsi: number;
    onHire?: boolean;
    active?: boolean;
    operationsClass: VesselOperationsClass;
    vessel_length: number;
    displacement: number;
    dist2bow?: number;
    isDaughterCraft: boolean;
    mothercraft_mmsi?: number;
    Propulsion_type?: string;

    speednotifylimit: MongoNumber;
    impactnotifylimit: MongoNumber;
    videoResetDay: MongoNumber;
    videobudget: MongoNumber;
}

export type VesselOperationsClass = 'CTV' | 'OSV' | 'SOV';
type MongoString = string | EmptyMatlabObject;
type MongoNumber = number | EmptyMatlabObject;

interface EmptyMatlabObject {
    _ArrayType_: string;
    _ArraySize_: number[];
    _ArrayData_: null;
}



export class VesselModel {
    // Database return array of this template
    Site: string;
    client: string[];
    Operator: MongoString;
    vesselname: string;
    nicename: string;
    mmsi: number;
    // I know that this is really ugly to do. But in Mongo this is still listed as operationsClass and in sql as operations_class
    // both are now added as optional to
    onHire?: boolean;
    active?: boolean;
    // I know that this is really ugly to do. But in Mongo this is still listed as operationsClass and in sql as operations_class
    // both are now added as optional to
    operationsClass?: VesselOperationsClass;
    operations_class?: VesselOperationsClass;
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

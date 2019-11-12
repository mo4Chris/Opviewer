



export class VesselModel {
    // Database return array of this template
    client: string | string[];
    Operator: string;
    vesselname: string;
    nicename: string;
    mmsi: number;
    onHire: boolean;

    operationsClass: 'CTV' | 'OSV' | 'SOV';
    vessel_length: number;
    displacement: number;
    dist2bow?: number;
    isDaughterCraft: boolean;
    mothercraft_mmsi?: number;
    Propulsion_type?: string;

    speednotifylimit: number | {};
    impactnotifylimit: number | {};
    videoResetDay: number;
    videobuget: number;
}

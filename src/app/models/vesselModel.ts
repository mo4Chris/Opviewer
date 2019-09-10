



export class VesselModel {
    // Database return array of this template
    client: string[];
    vesselname: string;
    nicename: string;
    mmsi: number;
    onHire: boolean;
    operationsClass: 'CTV' | 'OSV' | 'SOV';

    speedNotifyLimit: number | {};
    impactNotifyLimit: number | {};
    videoResetDay: number;
    videobuget: number;
}

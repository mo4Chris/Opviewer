



export class VesselModel {
    // Database return array of this template
    Site: string;
    client: string[];
    vesselname: string;
    nicename: string;
    mmsi: number;
    onHire: boolean;
    operationsClass: 'CTV' | 'OSV' | 'SOV';

    speedNotifyLimit: number | {};
    impactNotifyLimit: number | {};
    videoResetDay: number;
    videobudget: number;
}

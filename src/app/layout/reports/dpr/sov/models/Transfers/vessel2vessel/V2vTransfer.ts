export class V2vTransfer {
    vesselname: string;
    mmsi: number;
    startTime: number;
    stopTime: number;
    duration: number;
    toVesselname: string;
    toMMSI: number;
    peakWindGust: string;
    peakWindAvg: string;
    peakHeave: string;
    DPutilisation: string;
    current: string;
    type: string;
    Hs: string;
    Ts: string;
    turbineActivity: string;

    paxIn?: number;
    paxOut?: number;
    cargoIn?: number;
    cargoOut?: number;
    default_paxIn?: number;
    default_paxOut?: number;
}
